from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from ..models import User

def role_required(*allowed_roles):
    """
    Decorator to restrict route access to specific user roles (e.g., 'ADMIN', 'FACULTY', 'STUDENT').
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({'error': 'Account inactive or unauthorized'}), 403
            
            if user.role not in allowed_roles:
                return jsonify({
                    'error': f'Access forbidden: Required role in {list(allowed_roles)}, but current role is {user.role}'
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    """
    Helper to fetch the current authenticated User object from the JWT identity.
    """
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
    except Exception:
        pass
    return None
