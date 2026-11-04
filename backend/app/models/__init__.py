from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, StudentProfile, FacultyProfile, Department, Course, Skill, StudentSkill, StudentInterest
from .opportunity import Opportunity, Category, OpportunitySkill, SavedOpportunity
from .application import Application, ApplicationStatusHistory
from .notification import Notification, Reminder, Announcement, AuditLog

__all__ = [
    'db',
    'User',
    'StudentProfile',
    'FacultyProfile',
    'Department',
    'Course',
    'Skill',
    'StudentSkill',
    'StudentInterest',
    'Opportunity',
    'Category',
    'OpportunitySkill',
    'SavedOpportunity',
    'Application',
    'ApplicationStatusHistory',
    'Notification',
    'Reminder',
    'Announcement',
    'AuditLog'
]
