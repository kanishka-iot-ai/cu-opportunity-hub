from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User, StudentProfile, FacultyProfile, Department, Course, Skill, StudentSkill, StudentInterest, Category, AuditLog
from ..utils.auth_decorators import get_current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new Chandigarh University student.
    Accepts UID (e.g. 25BIT10180), email (25bit10180@cuchd.in), password, department, course, semester, cgpa, skills, interests.
    """
    data = request.get_json() or {}

    raw_uid = (data.get('uid') or '').strip().upper()
    raw_email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    full_name = (data.get('full_name') or '').strip()

    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    # Auto-generate email from UID if omitted, or derive UID from email
    if raw_uid and not raw_email:
        raw_email = f"{raw_uid.lower()}@cuchd.in"
    elif raw_email and not raw_uid:
        if raw_email.endswith('@cuchd.in'):
            raw_uid = raw_email.replace('@cuchd.in', '').upper()
        else:
            raw_uid = raw_email.split('@')[0].upper()

    if not raw_uid or not raw_email:
        return jsonify({'error': 'Valid Chandigarh University Student UID (e.g. 25BIT10180) or Email is required'}), 400

    # Check if user already exists
    existing_user = User.query.filter((User.uid == raw_uid) | (User.email == raw_email)).first()
    if existing_user:
        return jsonify({'error': f'User with UID {raw_uid} or email {raw_email} already exists'}), 409

    role = data.get('role', 'STUDENT').upper()
    if role not in ['STUDENT', 'FACULTY', 'ADMIN']:
        role = 'STUDENT'

    user = User(
        uid=raw_uid,
        email=raw_email,
        full_name=full_name,
        role=role,
        is_active=True
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    if role == 'STUDENT':
        student_profile = StudentProfile(
            user_id=user.id,
            department_id=data.get('department_id'),
            course_id=data.get('course_id'),
            current_semester=int(data.get('current_semester', 1)),
            academic_year=data.get('academic_year', '2025-2026'),
            cgpa=float(data.get('cgpa', 0.0)),
            phone=data.get('phone', ''),
            bio=data.get('bio', ''),
            linkedin_url=data.get('linkedin_url', ''),
            github_url=data.get('github_url', ''),
            portfolio_url=data.get('portfolio_url', ''),
            avatar_seed=f"cu_student_{user.id}"
        )
        db.session.add(student_profile)
        db.session.flush()

        # Add skills if provided
        skill_ids = data.get('skill_ids', [])
        for sid in skill_ids:
            skill = Skill.query.get(sid)
            if skill:
                db.session.add(StudentSkill(student_id=student_profile.id, skill_id=skill.id))

        # Add category interests if provided
        interest_category_ids = data.get('interest_category_ids', [])
        for cid in interest_category_ids:
            category = Category.query.get(cid)
            if category:
                db.session.add(StudentInterest(student_id=student_profile.id, category_id=category.id))

    elif role == 'FACULTY':
        faculty_profile = FacultyProfile(
            user_id=user.id,
            department_id=data.get('department_id'),
            designation=data.get('designation', 'Assistant Professor'),
            cabin_number=data.get('cabin_number', ''),
            office_hours=data.get('office_hours', '')
        )
        db.session.add(faculty_profile)

    # Audit log
    db.session.add(AuditLog(
        user_id=user.id,
        action='USER_REGISTERED',
        entity_type='USER',
        entity_id=user.id,
        details=f"New {role} registered: {user.full_name} ({user.uid})"
    ))

    db.session.commit()

    # Generate token
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Registration successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Unified login for Students, Faculty, and Administrators.
    Accepts UID (e.g. 25bit10180) or Email (25bit10180@cuchd.in / admin@cuchd.in).
    """
    data = request.get_json() or {}
    identifier = (data.get('identifier') or data.get('uid') or data.get('email') or '').strip()
    password = data.get('password')

    if not identifier or not password:
        return jsonify({'error': 'UID/Email and Password are required'}), 400

    # Search by UID (case insensitive) or Email (case insensitive)
    user = User.query.filter(
        (db.func.upper(User.uid) == identifier.upper()) |
        (db.func.lower(User.email) == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials. Check your UID/Email and Password.'}), 401

    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated by Chandigarh University Administration.'}), 403

    access_token = create_access_token(identity=str(user.id))

    # Audit log
    db.session.add(AuditLog(
        user_id=user.id,
        action='USER_LOGIN',
        entity_type='USER',
        entity_id=user.id,
        details=f"{user.role} logged in: {user.uid or user.email}"
    ))
    db.session.commit()

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    """
    Fetch the currently logged in user profile.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update student or faculty profile.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}

    # Update basic user fields
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()

    if user.role == 'STUDENT' and user.student_profile:
        profile = user.student_profile
        if 'department_id' in data:
            profile.department_id = data['department_id']
        if 'course_id' in data:
            profile.course_id = data['course_id']
        if 'current_semester' in data:
            profile.current_semester = int(data['current_semester'])
        if 'academic_year' in data:
            profile.academic_year = data['academic_year']
        if 'cgpa' in data:
            profile.cgpa = float(data['cgpa'])
        if 'phone' in data:
            profile.phone = data['phone']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'linkedin_url' in data:
            profile.linkedin_url = data['linkedin_url']
        if 'github_url' in data:
            profile.github_url = data['github_url']
        if 'portfolio_url' in data:
            profile.portfolio_url = data['portfolio_url']
        if 'resume_url' in data:
            profile.resume_url = data['resume_url']

        # Update skills
        if 'skill_ids' in data:
            StudentSkill.query.filter_by(student_id=profile.id).delete()
            for sid in data['skill_ids']:
                if Skill.query.get(sid):
                    db.session.add(StudentSkill(student_id=profile.id, skill_id=sid))

        # Update interests
        if 'interest_category_ids' in data:
            StudentInterest.query.filter_by(student_id=profile.id).delete()
            for cid in data['interest_category_ids']:
                if Category.query.get(cid):
                    db.session.add(StudentInterest(student_id=profile.id, category_id=cid))

    elif user.role == 'FACULTY' and user.faculty_profile:
        profile = user.faculty_profile
        if 'department_id' in data:
            profile.department_id = data['department_id']
        if 'designation' in data:
            profile.designation = data['designation']
        if 'cabin_number' in data:
            profile.cabin_number = data['cabin_number']
        if 'office_hours' in data:
            profile.office_hours = data['office_hours']

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200
