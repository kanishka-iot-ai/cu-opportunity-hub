from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Application, ApplicationStatusHistory, Opportunity, User, StudentProfile, AuditLog
from ..utils.auth_decorators import role_required

applications_bp = Blueprint('applications', __name__)

VALID_STATUSES = [
    'Interested',
    'Saved',
    'Planning to Apply',
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Selected',
    'Rejected',
    'Withdrawn'
]

@applications_bp.route('', methods=['GET'])
@jwt_required()
def list_applications():
    """
    List applications for current student.
    Filter by status, search by title/org.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.student_profile:
        return jsonify({'applications': [], 'total': 0}), 200

    query = Application.query.filter_by(student_id=user.student_profile.id)

    status = request.args.get('status')
    if status and status != 'ALL':
        query = query.filter(Application.current_status == status)

    q = request.args.get('q', '').strip()
    if q:
        query = query.join(Opportunity).filter(
            (Opportunity.title.ilike(f"%{q}%")) |
            (Opportunity.organization.ilike(f"%{q}%"))
        )

    sort = request.args.get('sort', 'newest')
    if sort == 'deadline':
        query = query.join(Opportunity).order_by(Opportunity.application_deadline.asc())
    elif sort == 'updated':
        query = query.order_by(Application.updated_at.desc())
    else:
        query = query.order_by(Application.created_at.desc())

    apps = query.all()
    return jsonify({
        'applications': [a.to_dict() for a in apps],
        'total': len(apps),
        'valid_statuses': VALID_STATUSES
    }), 200


@applications_bp.route('', methods=['POST'])
@jwt_required()
def create_or_update_application():
    """
    Create a new application or update an existing one.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.student_profile:
        return jsonify({'error': 'Student profile required to track applications'}), 400

    data = request.get_json() or {}
    opp_id = data.get('opportunity_id')
    status = data.get('status', 'Planning to Apply')

    if not opp_id:
        return jsonify({'error': 'opportunity_id is required'}), 400
    if status not in VALID_STATUSES:
        return jsonify({'error': f'Invalid status. Allowed: {VALID_STATUSES}'}), 400

    opp = Opportunity.query.get_or_404(opp_id)

    # Check if application already exists
    app = Application.query.filter_by(
        student_id=user.student_profile.id,
        opportunity_id=opp.id
    ).first()

    today = date.today()

    if not app:
        app = Application(
            student_id=user.student_profile.id,
            opportunity_id=opp.id,
            application_date=today,
            current_status=status,
            personal_notes=data.get('personal_notes', ''),
            follow_up_date=datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data.get('follow_up_date') else None,
            interview_date=datetime.fromisoformat(data['interview_date'].replace('Z', '+00:00')) if data.get('interview_date') else None
        )
        db.session.add(app)
        db.session.flush()

        # Add initial history
        history = ApplicationStatusHistory(
            application_id=app.id,
            previous_status=None,
            new_status=status,
            remarks=data.get('remarks', 'Initial status recorded')
        )
        db.session.add(history)
        message = 'Application tracker created'
    else:
        old_status = app.current_status
        app.current_status = status
        if 'personal_notes' in data:
            app.personal_notes = data['personal_notes']
        if 'follow_up_date' in data:
            app.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data['follow_up_date'] else None
        if 'interview_date' in data:
            app.interview_date = datetime.fromisoformat(data['interview_date'].replace('Z', '+00:00')) if data['interview_date'] else None

        if old_status != status:
            history = ApplicationStatusHistory(
                application_id=app.id,
                previous_status=old_status,
                new_status=status,
                remarks=data.get('remarks', f'Status updated from {old_status} to {status}')
            )
            db.session.add(history)
        message = 'Application status updated'

    db.session.commit()
    return jsonify({'message': message, 'application': app.to_dict()}), 200


@applications_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_application(id):
    """
    Update application details (status, notes, interview date, follow-up date).
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.student_profile:
        return jsonify({'error': 'Student profile required'}), 400

    app = Application.query.filter_by(id=id, student_id=user.student_profile.id).first_or_404()
    data = request.get_json() or {}

    new_status = data.get('status')
    if new_status and new_status in VALID_STATUSES and new_status != app.current_status:
        old_status = app.current_status
        app.current_status = new_status
        history = ApplicationStatusHistory(
            application_id=app.id,
            previous_status=old_status,
            new_status=new_status,
            remarks=data.get('remarks', f'Updated to {new_status}')
        )
        db.session.add(history)

    if 'personal_notes' in data:
        app.personal_notes = data['personal_notes']
    if 'follow_up_date' in data:
        app.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data['follow_up_date'] else None
    if 'interview_date' in data:
        app.interview_date = datetime.fromisoformat(data['interview_date'].replace('Z', '+00:00')) if data['interview_date'] else None

    db.session.commit()
    return jsonify({'message': 'Application updated', 'application': app.to_dict()}), 200


@applications_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_application(id):
    """
    Remove an application from tracking.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.student_profile:
        return jsonify({'error': 'Student profile required'}), 400

    app = Application.query.filter_by(id=id, student_id=user.student_profile.id).first_or_404()
    db.session.delete(app)
    db.session.commit()
    return jsonify({'message': 'Application removed from tracker'}), 200
