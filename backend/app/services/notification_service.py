"""
Notification and Reminder Service for CU Opportunity Hub
Chandigarh University Academic Opportunity Tracker
"""

from datetime import datetime, date, timedelta
from ..models import db, Notification, Reminder, SavedOpportunity, Application, Opportunity, User

def create_notification(user_id: int, title: str, message: str, notification_type: str = 'GENERAL', reference_id: int = None, reference_type: str = None) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id,
        reference_type=reference_type,
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()
    return notif

def scan_and_generate_deadline_notifications() -> int:
    """
    Scans active saved opportunities and pending applications.
    Generates timely notifications for students:
    - 7 days, 3 days, 1 day remaining.
    """
    count = 0
    today = date.today()

    # Find opportunities closing soon (within 7 days)
    urgent_opps = Opportunity.query.filter(
        Opportunity.application_deadline >= today,
        Opportunity.application_deadline <= today + timedelta(days=7),
        Opportunity.verification_status == 'Verified'
    ).all()

    for opp in urgent_opps:
        days_left = (opp.application_deadline - today).days
        urgency_label = "URGENT" if days_left <= 3 else "UPCOMING"
        
        # 1. Notify students who saved this opportunity
        saved_records = SavedOpportunity.query.filter_by(opportunity_id=opp.id).all()
        for saved in saved_records:
            # Check if notification already sent in last 24h
            existing = Notification.query.filter_by(
                user_id=saved.user_id,
                reference_id=opp.id,
                notification_type='DEADLINE'
            ).filter(Notification.created_at >= datetime.utcnow() - timedelta(days=1)).first()

            if not existing:
                create_notification(
                    user_id=saved.user_id,
                    title=f"⏳ [{urgency_label}] Deadline Alert: {opp.title[:45]}...",
                    message=f"The deadline for '{opp.title}' at {opp.organization} is in {days_left} day(s) on {opp.application_deadline.strftime('%d %b %Y')}. Complete your application before portal closes.",
                    notification_type='DEADLINE',
                    reference_id=opp.id,
                    reference_type='OPPORTUNITY'
                )
                count += 1

    return count
