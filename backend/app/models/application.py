from datetime import datetime, date
from . import db

class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id', ondelete='CASCADE'), nullable=False)
    opportunity_id = db.Column(db.Integer, db.ForeignKey('opportunities.id', ondelete='CASCADE'), nullable=False)
    application_date = db.Column(db.Date, nullable=False, default=date.today)
    
    # 10 statuses as specified in Prompt Section 7
    # 1. Interested, 2. Saved, 3. Planning to Apply, 4. Applied, 5. Under Review,
    # 6. Shortlisted, 7. Interview Scheduled, 8. Selected, 9. Rejected, 10. Withdrawn
    current_status = db.Column(db.String(40), nullable=False, default='Interested')
    personal_notes = db.Column(db.Text)
    follow_up_date = db.Column(db.Date)
    interview_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    history = db.relationship('ApplicationStatusHistory', backref='application', lazy=True, cascade='all, delete-orphan', order_by='desc(ApplicationStatusHistory.changed_at)')

    __table_args__ = (
        db.UniqueConstraint('student_id', 'opportunity_id', name='uq_student_opportunity_app'),
    )

    def to_dict(self, include_opportunity=True):
        data = {
            'id': self.id,
            'student_id': self.student_id,
            'opportunity_id': self.opportunity_id,
            'application_date': self.application_date.isoformat() if self.application_date else None,
            'current_status': self.current_status,
            'personal_notes': self.personal_notes,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'history': [h.to_dict() for h in self.history]
        }
        if include_opportunity and self.opportunity:
            data['opportunity'] = {
                'id': self.opportunity.id,
                'title': self.opportunity.title,
                'organization': self.opportunity.organization,
                'category_name': self.opportunity.category.name if self.opportunity.category else None,
                'category_slug': self.opportunity.category.slug if self.opportunity.category else None,
                'category_icon': self.opportunity.category.icon_name if self.opportunity.category else 'Award',
                'application_deadline': self.opportunity.application_deadline.isoformat() if self.opportunity.application_deadline else None,
                'days_remaining': self.opportunity.days_remaining,
                'deadline_urgency': self.opportunity.deadline_urgency,
                'official_url': self.opportunity.official_url,
                'location': self.opportunity.location,
                'mode': self.opportunity.mode,
                'is_paid': self.opportunity.is_paid,
                'stipend_amount': self.opportunity.stipend_amount
            }
        return data


class ApplicationStatusHistory(db.Model):
    __tablename__ = 'application_status_history'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False)
    previous_status = db.Column(db.String(40))
    new_status = db.Column(db.String(40), nullable=False)
    remarks = db.Column(db.String(255))
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'previous_status': self.previous_status,
            'new_status': self.new_status,
            'remarks': self.remarks,
            'changed_at': self.changed_at.isoformat() if self.changed_at else None
        }
