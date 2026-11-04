from datetime import datetime, date
import re
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, FacultyProfile, StudentProfile, Opportunity, Category, Department, Skill, OpportunitySkill, Announcement, Application, AuditLog
from ..utils.auth_decorators import role_required

faculty_bp = Blueprint('faculty', __name__)

def generate_slug(title):
    slug = re.sub(r'[^a-zA-Z0-9\s-]', '', title).lower().strip()
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug

@faculty_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@role_required('FACULTY', 'ADMIN')
def get_faculty_dashboard():
    """
    Department coordinator dashboard metrics.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    dept_id = user.faculty_profile.department_id if user.faculty_profile else None
    
    # Department info
    dept = Department.query.get(dept_id) if dept_id else None

    # Opportunities submitted by this faculty member
    my_opps = Opportunity.query.filter_by(created_by=user.id).order_by(Opportunity.created_at.desc()).all()

    # Department opportunities
    dept_opps_count = Opportunity.query.filter_by(department_id=dept_id).count() if dept_id else 0

    # Students in department
    dept_students_count = StudentProfile.query.filter_by(department_id=dept_id).count() if dept_id else 0

    # Applications by department students
    dept_student_ids = [sp.id for sp in StudentProfile.query.filter_by(department_id=dept_id).all()] if dept_id else []
    dept_apps_count = Application.query.filter(Application.student_id.in_(dept_student_ids)).count() if dept_student_ids else 0

    # Announcements
    announcements = Announcement.query.filter(
        (Announcement.department_id == dept_id) | (Announcement.department_id.is_(None))
    ).order_by(Announcement.created_at.desc()).limit(10).all()

    return jsonify({
        'faculty': user.to_dict(),
        'department': dept.to_dict() if dept else None,
        'stats': {
            'submitted_opportunities': len(my_opps),
            'department_opportunities': dept_opps_count,
            'department_students': dept_students_count,
            'department_applications': dept_apps_count
        },
        'my_opportunities': [o.to_dict() for o in my_opps],
        'announcements': [a.to_dict() for a in announcements]
    }), 200


@faculty_bp.route('/announcements', methods=['GET'])
def list_announcements():
    """
    List announcements for students and faculty.
    """
    dept_id = request.args.get('department_id')
    query = Announcement.query

    if dept_id:
        query = query.filter((Announcement.department_id == int(dept_id)) | (Announcement.department_id.is_(None)))

    announcements = query.order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc()).limit(30).all()
    return jsonify({'announcements': [a.to_dict() for a in announcements]}), 200


@faculty_bp.route('/announcements', methods=['POST'])
@jwt_required()
@role_required('FACULTY', 'ADMIN')
def post_announcement():
    """
    Post a new official departmental announcement.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    dept_id = data.get('department_id')
    if not dept_id and user.faculty_profile:
        dept_id = user.faculty_profile.department_id

    announcement = Announcement(
        title=title,
        content=content,
        department_id=dept_id,
        author_id=user.id,
        target_audience=data.get('target_audience', 'ALL'),
        is_pinned=bool(data.get('is_pinned', False))
    )
    db.session.add(announcement)
    db.session.commit()

    return jsonify({
        'message': 'Announcement published successfully',
        'announcement': announcement.to_dict()
    }), 201
