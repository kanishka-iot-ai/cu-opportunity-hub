from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Notification, Reminder, User, Opportunity
from ..services.notification_service import create_notification, scan_and_generate_deadline_notifications

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Get in-app notifications for the current user.
    """
    user_id = get_jwt_identity()
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return jsonify({
        'notifications': [n.to_dict() for n in notifs],
        'unread_count': unread_count
    }), 200


@notifications_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_read(id):
    """
    Mark a single notification as read.
    """
    user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=id, user_id=user_id).first_or_404()
    notif.is_read = True
    db.session.commit()
    return jsonify({'message': 'Notification marked as read', 'notification': notif.to_dict()}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    """
    Mark all notifications as read for current user.
    """
    user_id = get_jwt_identity()
    Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200


@notifications_bp.route('/reminders', methods=['GET'])
@jwt_required()
def get_reminders():
    """
    Get personal reminders created by user.
    """
    user_id = get_jwt_identity()
    reminders = Reminder.query.filter_by(user_id=user_id).order_by(Reminder.reminder_date.asc()).all()
    return jsonify({
        'reminders': [r.to_dict() for r in reminders],
        'total': len(reminders)
    }), 200


@notifications_bp.route('/reminders', methods=['POST'])
@jwt_required()
def create_reminder():
    """
    Create a personal deadline/application reminder.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    title = data.get('title')
    reminder_date_str = data.get('reminder_date')
    opp_id = data.get('opportunity_id')

    if not title or not reminder_date_str:
        return jsonify({'error': 'Title and reminder date are required'}), 400

    try:
        reminder_date = datetime.fromisoformat(reminder_date_str.replace('Z', '+00:00'))
    except Exception:
        return jsonify({'error': 'Invalid date format (ISO 8601 required)'}), 400

    reminder = Reminder(
        user_id=user_id,
        opportunity_id=opp_id,
        title=title,
        reminder_date=reminder_date,
        is_completed=False,
        notes=data.get('notes', '')
    )
    db.session.add(reminder)
    db.session.commit()

    return jsonify({
        'message': 'Reminder created successfully',
        'reminder': reminder.to_dict()
    }), 201


@notifications_bp.route('/reminders/<int:id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_reminder(id):
    """
    Toggle reminder completion.
    """
    user_id = get_jwt_identity()
    reminder = Reminder.query.filter_by(id=id, user_id=user_id).first_or_404()
    reminder.is_completed = not reminder.is_completed
    db.session.commit()

    return jsonify({
        'message': 'Reminder status updated',
        'reminder': reminder.to_dict()
    }), 200


@notifications_bp.route('/reminders/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_reminder(id):
    """
    Delete a personal reminder.
    """
    user_id = get_jwt_identity()
    reminder = Reminder.query.filter_by(id=id, user_id=user_id).first_or_404()
    db.session.delete(reminder)
    db.session.commit()

    return jsonify({'message': 'Reminder deleted successfully'}), 200


@notifications_bp.route('/trigger-deadline-scan', methods=['POST'])
@jwt_required()
def trigger_deadline_scan():
    """
    Scans and generates upcoming deadline reminders for saved/tracked opportunities.
    """
    count = scan_and_generate_deadline_notifications()
    return jsonify({'message': f'Deadline check complete. {count} new notification(s) generated.'}), 200
