from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(30), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    institute = db.Column(db.String(150), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    courses = db.relationship('Course', backref='department', lazy=True, cascade='all, delete-orphan')
    students = db.relationship('StudentProfile', backref='department', lazy=True)
    faculty = db.relationship('FacultyProfile', backref='department', lazy=True)
    opportunities = db.relationship('Opportunity', backref='department', lazy=True)
    announcements = db.relationship('Announcement', backref='department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'institute': self.institute
        }


class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    code = db.Column(db.String(40), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    degree_type = db.Column(db.String(50), default='Undergraduate')
    duration_years = db.Column(db.Integer, default=4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    students = db.relationship('StudentProfile', backref='course', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'department_id': self.department_id,
            'code': self.code,
            'name': self.name,
            'degree_type': self.degree_type,
            'duration_years': self.duration_years
        }


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String(50), unique=True, nullable=True) # e.g. 25BIT10180
    email = db.Column(db.String(120), unique=True, nullable=False) # e.g. 25bit10180@cuchd.in
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='STUDENT') # STUDENT, ADMIN, FACULTY
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    faculty_profile = db.relationship('FacultyProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')
    reminders = db.relationship('Reminder', backref='user', lazy=True, cascade='all, delete-orphan')
    saved_opportunities = db.relationship('SavedOpportunity', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_profile=True):
        data = {
            'id': self.id,
            'uid': self.uid,
            'email': self.email,
            'full_name': self.full_name,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_profile:
            if self.role == 'STUDENT' and self.student_profile:
                data['profile'] = self.student_profile.to_dict()
            elif self.role == 'FACULTY' and self.faculty_profile:
                data['profile'] = self.faculty_profile.to_dict()
        return data


class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(60), default='Technical')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category
        }


class StudentSkill(db.Model):
    __tablename__ = 'student_skills'

    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id', ondelete='CASCADE'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
    proficiency_level = db.Column(db.String(30), default='Intermediate')

    skill = db.relationship('Skill')


class StudentInterest(db.Model):
    __tablename__ = 'student_interests'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category = db.relationship('Category')


class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='SET NULL'), nullable=True)
    current_semester = db.Column(db.Integer, default=1)
    academic_year = db.Column(db.String(20), default='2025-2026')
    cgpa = db.Column(db.Float, default=0.0)
    phone = db.Column(db.String(20))
    bio = db.Column(db.Text)
    linkedin_url = db.Column(db.String(255))
    github_url = db.Column(db.String(255))
    portfolio_url = db.Column(db.String(255))
    resume_url = db.Column(db.String(255))
    avatar_seed = db.Column(db.String(50), default='cu_student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_skills = db.relationship('StudentSkill', backref='student', lazy=True, cascade='all, delete-orphan')
    student_interests = db.relationship('StudentInterest', backref='student', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='student', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        skills_list = []
        for ss in self.student_skills:
            if ss.skill:
                skills_list.append({
                    'id': ss.skill.id,
                    'name': ss.skill.name,
                    'category': ss.skill.category,
                    'proficiency_level': ss.proficiency_level
                })

        interests_list = []
        for si in self.student_interests:
            if si.category:
                interests_list.append({
                    'id': si.category.id,
                    'name': si.category.name,
                    'slug': si.category.slug
                })

        return {
            'id': self.id,
            'user_id': self.user_id,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'course_id': self.course_id,
            'course_name': self.course.name if self.course else None,
            'course_code': self.course.code if self.course else None,
            'current_semester': self.current_semester,
            'academic_year': self.academic_year,
            'cgpa': self.cgpa,
            'phone': self.phone,
            'bio': self.bio,
            'linkedin_url': self.linkedin_url,
            'github_url': self.github_url,
            'portfolio_url': self.portfolio_url,
            'resume_url': self.resume_url,
            'avatar_seed': self.avatar_seed,
            'skills': skills_list,
            'interests': interests_list
        }


class FacultyProfile(db.Model):
    __tablename__ = 'faculty_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    designation = db.Column(db.String(100), default='Assistant Professor')
    cabin_number = db.Column(db.String(50))
    office_hours = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else None,
            'department_code': self.department.code if self.department else None,
            'designation': self.designation,
            'cabin_number': self.cabin_number,
            'office_hours': self.office_hours
        }
