from datetime import datetime, date
import re
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import (
    db, User, StudentProfile, FacultyProfile, Opportunity, Category,
    Department, Course, Skill, OpportunitySkill, Application, AuditLog
)
from ..utils.auth_decorators import role_required

admin_bp = Blueprint('admin', __name__)

def generate_slug(title):
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower().strip()
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('ADMIN')
def get_admin_stats():
    """
    Comprehensive platform analytics for Chandigarh University administrators.
    """
    today = date.today()

    total_students = User.query.filter_by(role='STUDENT').count()
    active_students = User.query.filter_by(role='STUDENT', is_active=True).count()
    total_faculty = User.query.filter_by(role='FACULTY').count()

    total_opps = Opportunity.query.count()
    active_opps = Opportunity.query.filter(
        Opportunity.verification_status == 'Verified',
        Opportunity.application_deadline >= today
    ).count()
    expired_opps = Opportunity.query.filter(Opportunity.application_deadline < today).count()
    pending_approvals = Opportunity.query.filter_by(verification_status='Pending Verification').count()

    total_apps = Application.query.count()
    selected_apps = Application.query.filter_by(current_status='Selected').count()
    shortlisted_apps = Application.query.filter_by(current_status='Shortlisted').count()

    # Category breakdown (for charts)
    cats = Category.query.all()
    category_data = []
    for c in cats:
        cnt = Opportunity.query.filter_by(category_id=c.id).count()
        if cnt > 0:
            category_data.append({
                'name': c.name,
                'count': cnt
            })
    category_data.sort(key=lambda x: x['count'], reverse=True)

    # Applications by Department
    depts = Department.query.all()
    dept_app_data = []
    for d in depts:
        student_ids = [sp.id for sp in d.students]
        if student_ids:
            app_cnt = Application.query.filter(Application.student_id.in_(student_ids)).count()
        else:
            app_cnt = 0
        dept_app_data.append({
            'code': d.code,
            'name': d.name,
            'applications': app_cnt,
            'students': len(student_ids)
        })

    # Status Distribution
    status_counts = {}
    all_apps = Application.query.all()
    for a in all_apps:
        status_counts[a.current_status] = status_counts.get(a.current_status, 0) + 1

    return jsonify({
        'overview': {
            'total_students': total_students,
            'active_students': active_students,
            'total_faculty': total_faculty,
            'total_opportunities': total_opps,
            'active_opportunities': active_opps,
            'expired_opportunities': expired_opps,
            'pending_approvals': pending_approvals,
            'total_applications': total_apps,
            'selected_applications': selected_apps,
            'shortlisted_applications': shortlisted_apps,
            'success_rate': round((selected_apps / total_apps * 100), 1) if total_apps > 0 else 0.0
        },
        'category_distribution': category_data[:10],
        'department_applications': dept_app_data,
        'status_distribution': [{'status': k, 'count': v} for k, v in status_counts.items()]
    }), 200


@admin_bp.route('/opportunities', methods=['GET'])
@jwt_required()
@role_required('ADMIN')
def list_admin_opportunities():
    """
    List opportunities with verification status filter for Admin.
    """
    v_status = request.args.get('verification_status')
    query = Opportunity.query

    if v_status and v_status != 'ALL':
        query = query.filter_by(verification_status=v_status)

    q = request.args.get('q', '').strip()
    if q:
        query = query.filter(
            (Opportunity.title.ilike(f"%{q}%")) |
            (Opportunity.organization.ilike(f"%{q}%"))
        )

    opps = query.order_by(Opportunity.created_at.desc()).all()
    return jsonify({
        'opportunities': [o.to_dict() for o in opps],
        'total': len(opps)
    }), 200


@admin_bp.route('/opportunities', methods=['POST'])
@jwt_required()
@role_required('ADMIN', 'FACULTY')
def create_opportunity():
    """
    Create a new opportunity.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    base_slug = generate_slug(title)
    slug = base_slug
    idx = 1
    while Opportunity.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{idx}"
        idx += 1

    deadline_str = data.get('application_deadline')
    if not deadline_str:
        return jsonify({'error': 'Application deadline is required'}), 400

    try:
        deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
    except Exception:
        return jsonify({'error': 'Invalid deadline date format (YYYY-MM-DD required)'}), 400

    # Auto-verify if admin, or pending if faculty
    default_verification = 'Verified' if user.role == 'ADMIN' else 'Pending Verification'

    opp = Opportunity(
        title=title,
        slug=slug,
        organization=data.get('organization', 'Chandigarh University'),
        category_id=int(data.get('category_id', 1)),
        department_id=data.get('department_id') if data.get('department_id') else None,
        short_description=data.get('short_description', ''),
        full_description=data.get('full_description', ''),
        eligibility_criteria=data.get('eligibility_criteria', 'Open to eligible CU students'),
        min_cgpa=float(data.get('min_cgpa', 0.0)),
        target_semesters=data.get('target_semesters', 'ALL'),
        target_degrees=data.get('target_degrees', 'ALL'),
        benefits=data.get('benefits', ''),
        required_documents=data.get('required_documents', 'Resume, CU ID Card'),
        application_procedure=data.get('application_procedure', 'Apply via official link'),
        official_url=data.get('official_url', 'https://www.cuchd.in'),
        contact_email=data.get('contact_email', 'placements@cuchd.in'),
        location=data.get('location', 'Online / Campus'),
        mode=data.get('mode', 'Online'),
        is_paid=bool(data.get('is_paid', False)),
        stipend_amount=data.get('stipend_amount', ''),
        published_date=date.today(),
        application_deadline=deadline,
        verification_status=data.get('verification_status', default_verification),
        last_verified_date=date.today(),
        source_name=data.get('source_name', 'Chandigarh University Portal'),
        created_by=user.id
    )

    db.session.add(opp)
    db.session.flush()

    # Link skills
    skill_ids = data.get('skill_ids', [])
    for sid in skill_ids:
        if Skill.query.get(sid):
            db.session.add(OpportunitySkill(opportunity_id=opp.id, skill_id=sid))

    # Audit log
    db.session.add(AuditLog(
        user_id=user.id,
        action='OPPORTUNITY_CREATED',
        entity_type='OPPORTUNITY',
        entity_id=opp.id,
        details=f"Created opportunity '{opp.title}' (Status: {opp.verification_status})"
    ))

    db.session.commit()
    return jsonify({'message': 'Opportunity created successfully', 'opportunity': opp.to_dict()}), 201


@admin_bp.route('/opportunities/<int:id>', methods=['PUT'])
@jwt_required()
@role_required('ADMIN')
def update_opportunity(id):
    """
    Update opportunity details.
    """
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(id)
    data = request.get_json() or {}

    if 'title' in data and data['title'].strip():
        opp.title = data['title'].strip()
    if 'organization' in data:
        opp.organization = data['organization']
    if 'category_id' in data:
        opp.category_id = int(data['category_id'])
    if 'department_id' in data:
        opp.department_id = data['department_id'] if data['department_id'] else None
    if 'short_description' in data:
        opp.short_description = data['short_description']
    if 'full_description' in data:
        opp.full_description = data['full_description']
    if 'eligibility_criteria' in data:
        opp.eligibility_criteria = data['eligibility_criteria']
    if 'min_cgpa' in data:
        opp.min_cgpa = float(data['min_cgpa'])
    if 'target_semesters' in data:
        opp.target_semesters = data['target_semesters']
    if 'target_degrees' in data:
        opp.target_degrees = data['target_degrees']
    if 'benefits' in data:
        opp.benefits = data['benefits']
    if 'required_documents' in data:
        opp.required_documents = data['required_documents']
    if 'application_procedure' in data:
        opp.application_procedure = data['application_procedure']
    if 'official_url' in data:
        opp.official_url = data['official_url']
    if 'contact_email' in data:
        opp.contact_email = data['contact_email']
    if 'location' in data:
        opp.location = data['location']
    if 'mode' in data:
        opp.mode = data['mode']
    if 'is_paid' in data:
        opp.is_paid = bool(data['is_paid'])
    if 'stipend_amount' in data:
        opp.stipend_amount = data['stipend_amount']
    if 'application_deadline' in data:
        opp.application_deadline = datetime.strptime(data['application_deadline'], '%Y-%m-%d').date()
    if 'verification_status' in data:
        opp.verification_status = data['verification_status']
    if 'source_name' in data:
        opp.source_name = data['source_name']

    # Update skills
    if 'skill_ids' in data:
        OpportunitySkill.query.filter_by(opportunity_id=opp.id).delete()
        for sid in data['skill_ids']:
            if Skill.query.get(sid):
                db.session.add(OpportunitySkill(opportunity_id=opp.id, skill_id=sid))

    opp.last_verified_date = date.today()

    db.session.add(AuditLog(
        user_id=user_id,
        action='OPPORTUNITY_UPDATED',
        entity_type='OPPORTUNITY',
        entity_id=opp.id,
        details=f"Updated opportunity: {opp.title}"
    ))

    db.session.commit()
    return jsonify({'message': 'Opportunity updated successfully', 'opportunity': opp.to_dict()}), 200


@admin_bp.route('/opportunities/<int:id>/verify', methods=['PUT'])
@jwt_required()
@role_required('ADMIN')
def verify_opportunity(id):
    """
    Approve or reject an opportunity submitted by faculty or coordinator.
    """
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(id)
    data = request.get_json() or {}

    status = data.get('status', 'Verified')
    if status not in ['Verified', 'Pending Verification', 'Rejected', 'Expired']:
        return jsonify({'error': 'Invalid verification status'}), 400

    opp.verification_status = status
    opp.last_verified_date = date.today()

    db.session.add(AuditLog(
        user_id=user_id,
        action='OPPORTUNITY_VERIFIED',
        entity_type='OPPORTUNITY',
        entity_id=opp.id,
        details=f"Set verification status of '{opp.title}' to {status}"
    ))

    db.session.commit()
    return jsonify({'message': f'Opportunity status set to {status}', 'opportunity': opp.to_dict()}), 200


@admin_bp.route('/opportunities/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required('ADMIN')
def delete_opportunity(id):
    """
    Delete an opportunity.
    """
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(id)

    db.session.add(AuditLog(
        user_id=user_id,
        action='OPPORTUNITY_DELETED',
        entity_type='OPPORTUNITY',
        entity_id=opp.id,
        details=f"Deleted opportunity: {opp.title}"
    ))

    db.session.delete(opp)
    db.session.commit()
    return jsonify({'message': 'Opportunity deleted successfully'}), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('ADMIN')
def list_users():
    """
    List registered users with search, role, and department filter.
    """
    role = request.args.get('role')
    q = request.args.get('q', '').strip()

    query = User.query
    if role and role != 'ALL':
        query = query.filter_by(role=role)
    if q:
        query = query.filter(
            (User.full_name.ilike(f"%{q}%")) |
            (User.email.ilike(f"%{q}%")) |
            (User.uid.ilike(f"%{q}%"))
        )

    users = query.order_by(User.created_at.desc()).all()
    return jsonify({
        'users': [u.to_dict(include_profile=True) for u in users],
        'total': len(users)
    }), 200


@admin_bp.route('/users/<int:id>/toggle-status', methods=['PUT'])
@jwt_required()
@role_required('ADMIN')
def toggle_user_status(id):
    """
    Activate or deactivate a student or faculty account.
    """
    admin_id = get_jwt_identity()
    user = User.query.get_or_404(id)

    user.is_active = not user.is_active

    db.session.add(AuditLog(
        user_id=admin_id,
        action='USER_STATUS_TOGGLED',
        entity_type='USER',
        entity_id=user.id,
        details=f"Changed active status of {user.email} to {user.is_active}"
    ))

    db.session.commit()
    return jsonify({
        'message': f"Account {'activated' if user.is_active else 'deactivated'}",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@jwt_required()
@role_required('ADMIN')
def get_audit_logs():
    """
    Retrieve system audit logs.
    """
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify({'logs': [l.to_dict() for l in logs]}), 200
