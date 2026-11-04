from datetime import datetime, date
from . import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon_name = db.Column(db.String(50), default='Award')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    opportunities = db.relationship('Opportunity', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon_name': self.icon_name
        }


class OpportunitySkill(db.Model):
    __tablename__ = 'opportunity_skills'

    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id', ondelete='CASCADE'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)

    skill = db.relationship('Skill')


class Opportunity(db.Model):
    __tablename__ = 'opportunities'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    organization = db.Column(db.String(255), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True) # NULL means all departments
    
    short_description = db.Column(db.String(500), nullable=False)
    full_description = db.Column(db.Text, nullable=False)
    eligibility_criteria = db.Column(db.Text, nullable=False)
    min_cgpa = db.Column(db.Float, default=0.0)
    target_semesters = db.Column(db.String(100), default='ALL') # e.g. "3,4,5,6" or "ALL"
    target_degrees = db.Column(db.String(150), default='ALL') # e.g. "B.Tech, BCA, MCA" or "ALL"
    benefits = db.Column(db.Text)
    required_documents = db.Column(db.Text)
    application_procedure = db.Column(db.Text)
    official_url = db.Column(db.String(500), nullable=False)
    contact_email = db.Column(db.String(120))
    
    location = db.Column(db.String(150), default='Online')
    mode = db.Column(db.String(30), default='Online') # Online, Offline, Hybrid
    is_paid = db.Column(db.Boolean, default=False)
    stipend_amount = db.Column(db.String(120))
    
    published_date = db.Column(db.Date, nullable=False, default=date.today)
    application_deadline = db.Column(db.Date, nullable=False)
    verification_status = db.Column(db.String(40), default='Verified') # Verified, Pending Verification, Rejected, Expired
    last_verified_date = db.Column(db.Date, default=date.today)
    source_name = db.Column(db.String(150), nullable=False)
    
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    views_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    skills = db.relationship('OpportunitySkill', backref='opportunity', lazy=True, cascade='all, delete-orphan')
    applications = db.relationship('Application', backref='opportunity', lazy=True, cascade='all, delete-orphan')
    saved_by = db.relationship('SavedOpportunity', backref='opportunity', lazy=True, cascade='all, delete-orphan')
    reminders = db.relationship('Reminder', backref='opportunity', lazy=True, cascade='all, delete-orphan')

    @property
    def days_remaining(self):
        if not self.application_deadline:
            return 0
        delta = self.application_deadline - date.today()
        return delta.days

    @property
    def deadline_urgency(self):
        days = self.days_remaining
        if days < 0:
            return 'EXPIRED' # Grey
        elif days <= 3:
            return 'CRITICAL' # Red (< 3 days)
        elif days <= 7:
            return 'WARNING' # Yellow (3-7 days)
        else:
            return 'NORMAL' # Green (> 7 days)

    def to_dict(self, student_user_id=None):
        skills_list = []
        for os_rel in self.skills:
            if os_rel.skill:
                skills_list.append({
                    'id': os_rel.skill.id,
                    'name': os_rel.skill.name,
                    'category': os_rel.skill.category
                })

        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'organization': self.organization,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'category_slug': self.category.slug if self.category else None,
            'category_icon': self.category.icon_name if self.category else 'Award',
            'department_id': self.department_id,
            'department_name': self.department.name if self.department else 'All Departments (University Wide)',
            'department_code': self.department.code if self.department else 'ALL',
            'short_description': self.short_description,
            'full_description': self.full_description,
            'eligibility_criteria': self.eligibility_criteria,
            'min_cgpa': self.min_cgpa,
            'target_semesters': self.target_semesters,
            'target_degrees': self.target_degrees,
            'benefits': self.benefits,
            'required_documents': self.required_documents,
            'application_procedure': self.application_procedure,
            'official_url': self.official_url,
            'contact_email': self.contact_email,
            'location': self.location,
            'mode': self.mode,
            'is_paid': self.is_paid,
            'stipend_amount': self.stipend_amount,
            'published_date': self.published_date.isoformat() if self.published_date else None,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'days_remaining': self.days_remaining,
            'deadline_urgency': self.deadline_urgency,
            'verification_status': self.verification_status,
            'last_verified_date': self.last_verified_date.isoformat() if self.last_verified_date else None,
            'source_name': self.source_name,
            'views_count': self.views_count,
            'skills': skills_list,
            'is_saved': False,
            'user_application_status': None
        }

        if student_user_id:
            # Check if saved
            saved = SavedOpportunity.query.filter_by(user_id=student_user_id, opportunity_id=self.id).first()
            if saved:
                data['is_saved'] = True

        return data


class SavedOpportunity(db.Model):
    __tablename__ = 'saved_opportunities'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('user_id', 'opportunity_id', name='uq_user_saved_opp'),)
