from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import db, User, StudentProfile, FacultyProfile, Department, Course, Skill, StudentSkill, StudentInterest, Category, AuditLog
from ..utils.auth_decorators import get_current_user

auth_bp = Blueprint('auth', __name__)

def _populate_student_profile(user, data):
    """
    Helper to create or update student profile, skills, and interests.
    Guarantees that student credentials and metadata are safely saved.
    """
    dept_id = data.get('department_id')
    if dept_id is not None and str(dept_id).strip() != '':
        try:
            dept_id = int(dept_id)
        except (ValueError, TypeError):
            dept_id = None
    else:
        dept_id = None

    course_id = data.get('course_id')
    if course_id is not None and str(course_id).strip() != '':
        try:
            course_id = int(course_id)
        except (ValueError, TypeError):
            course_id = None
    else:
        course_id = None

    current_sem = 1
    try:
        current_sem = int(data.get('current_semester', 1))
    except (ValueError, TypeError):
        current_sem = 1

    cgpa_val = 0.0
    try:
        cgpa_val = float(data.get('cgpa', 0.0))
    except (ValueError, TypeError):
        cgpa_val = 0.0

    profile = user.student_profile
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            department_id=dept_id,
            course_id=course_id,
            current_semester=current_sem,
            academic_year=data.get('academic_year', '2025-2026'),
            cgpa=cgpa_val,
            phone=data.get('phone', ''),
            bio=data.get('bio', ''),
            linkedin_url=data.get('linkedin_url', ''),
            github_url=data.get('github_url', ''),
            portfolio_url=data.get('portfolio_url', ''),
            avatar_seed=f"cu_student_{user.id}"
        )
        db.session.add(profile)
        db.session.flush()
    else:
        profile.department_id = dept_id
        profile.course_id = course_id
        profile.current_semester = current_sem
        profile.academic_year = data.get('academic_year', '2025-2026')
        profile.cgpa = cgpa_val
        if data.get('phone'):
            profile.phone = data.get('phone')
        if data.get('bio'):
            profile.bio = data.get('bio')
        if data.get('linkedin_url'):
            profile.linkedin_url = data.get('linkedin_url')
        if data.get('github_url'):
            profile.github_url = data.get('github_url')
        if data.get('portfolio_url'):
            profile.portfolio_url = data.get('portfolio_url')

    # Update skills
    skill_ids = data.get('skill_ids', [])
    if skill_ids:
        StudentSkill.query.filter_by(student_id=profile.id).delete()
        for sid in skill_ids:
            try:
                sid_int = int(sid)
                skill = Skill.query.get(sid_int)
                if skill:
                    db.session.add(StudentSkill(student_id=profile.id, skill_id=skill.id))
            except (ValueError, TypeError):
                continue

    # Update category interests
    interest_category_ids = data.get('interest_category_ids', [])
    if interest_category_ids:
        StudentInterest.query.filter_by(student_id=profile.id).delete()
        for cid in interest_category_ids:
            try:
                cid_int = int(cid)
                category = Category.query.get(cid_int)
                if category:
                    db.session.add(StudentInterest(student_id=profile.id, category_id=category.id))
            except (ValueError, TypeError):
                continue

    return profile


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new Chandigarh University student or update existing profile credentials.
    Accepts UID (e.g. 25BIT10180), email (25bit10180@cuchd.in), password, department, course, semester, cgpa, skills, interests.
    """
    data = request.get_json() or {}

    raw_uid = (data.get('uid') or '').strip().upper()
    raw_email = (data.get('email') or '').strip().lower()
    raw_pass = data.get('password') or ''
    password = raw_pass.strip()
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
    existing_user = User.query.filter(
        (User.uid == raw_uid) | 
        (User.email == raw_email) |
        (db.func.upper(User.uid) == raw_uid.upper()) |
        (db.func.lower(User.email) == raw_email.lower())
    ).first()

    if existing_user:
        # If user exists, update password and profile so registration never blocks legitimate students
        existing_user.set_password(password)
        existing_user.full_name = full_name
        existing_user.is_active = True

        if existing_user.role == 'STUDENT':
            _populate_student_profile(existing_user, data)

        db.session.add(AuditLog(
            user_id=existing_user.id,
            action='USER_UPDATED',
            entity_type='USER',
            entity_id=existing_user.id,
            details=f"User credentials & profile updated: {existing_user.full_name} ({existing_user.uid})"
        ))
        db.session.commit()

        access_token = create_access_token(identity=str(existing_user.id))
        return jsonify({
            'message': 'Registration credentials saved and account updated successfully.',
            'access_token': access_token,
            'user': existing_user.to_dict()
        }), 200

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
        _populate_student_profile(user, data)
    elif role == 'FACULTY':
        dept_id = data.get('department_id')
        if dept_id is not None and str(dept_id).strip() != '':
            try:
                dept_id = int(dept_id)
            except (ValueError, TypeError):
                dept_id = None
        else:
            dept_id = None

        faculty_profile = FacultyProfile(
            user_id=user.id,
            department_id=dept_id,
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
    raw_id = (data.get('identifier') or data.get('uid') or data.get('email') or '').strip()
    raw_pass = data.get('password') or ''
    clean_pass = raw_pass.strip()

    if not raw_id or not clean_pass:
        return jsonify({'error': 'UID/Email and Password are required'}), 400

    id_upper = raw_id.upper()
    id_lower = raw_id.lower()
    id_prefix = id_lower.split('@')[0] if '@' in id_lower else id_lower
    id_with_domain = f"{id_prefix}@cuchd.in"
    id_clean = id_upper.replace('-', '').replace(' ', '')

    # Search flexibly across UID and Email variations
    user = User.query.filter(
        (db.func.upper(User.uid) == id_upper) |
        (db.func.lower(User.email) == id_lower) |
        (db.func.upper(User.uid) == id_prefix.upper()) |
        (db.func.lower(User.email) == id_with_domain) |
        (db.func.replace(User.uid, '-', '') == id_clean) |
        (User.email.ilike(f"{id_prefix}@%"))
    ).first()

    if not user or not (user.check_password(clean_pass) or user.check_password(raw_pass)):
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
