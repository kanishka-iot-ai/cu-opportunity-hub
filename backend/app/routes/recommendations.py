from datetime import date
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Opportunity, User, StudentProfile, SavedOpportunity, Application
from ..services.recommendation_service import calculate_opportunity_recommendation

recommendations_bp = Blueprint('recommendations', __name__)

@recommendations_bp.route('', methods=['GET'])
@jwt_required()
def get_recommendations():
    """
    Get personalized recommendations for the logged in student based on:
    - Department (25 pts)
    - Course (20 pts)
    - Skills (25 pts)
    - Current Semester (15 pts)
    - Interests (15 pts)
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not user.student_profile:
        return jsonify({
            'recommendations': [],
            'profile_complete': False,
            'message': 'Student profile required for recommendations'
        }), 200

    profile = user.student_profile
    today = date.today()

    # Query active verified opportunities
    active_opps = Opportunity.query.filter(
        Opportunity.verification_status == 'Verified',
        Opportunity.application_deadline >= today
    ).all()

    # Pre-fetch saved & application statuses
    saved_records = SavedOpportunity.query.filter_by(user_id=user.id).all()
    saved_ids = {s.opportunity_id for s in saved_records}

    apps = Application.query.filter_by(student_id=profile.id).all()
    app_status_map = {a.opportunity_id: a.current_status for a in apps}

    recommended_list = []
    for opp in active_opps:
        rec_data = calculate_opportunity_recommendation(profile, opp)
        
        opp_dict = opp.to_dict()
        opp_dict['is_saved'] = opp.id in saved_ids
        opp_dict['user_application_status'] = app_status_map.get(opp.id)
        opp_dict['recommendation'] = rec_data

        recommended_list.append(opp_dict)

    # Sort primarily by match score descending, then by deadline urgency
    recommended_list.sort(key=lambda x: (
        x['recommendation']['score'],
        -x['days_remaining'] if x['days_remaining'] >= 0 else -999
    ), reverse=True)

    # Filter parameter: 'all', 'eligible_only', 'high_match'
    filter_type = request.args.get('filter', 'all')
    if filter_type == 'eligible_only':
        filtered = [r for r in recommended_list if r['recommendation']['is_eligible']]
    elif filter_type == 'high_match':
        filtered = [r for r in recommended_list if r['recommendation']['score'] >= 50]
    else:
        filtered = recommended_list

    return jsonify({
        'recommendations': filtered,
        'total': len(filtered),
        'profile_complete': bool(profile.department_id and profile.course_id and profile.current_semester),
        'student_metrics': {
            'department': profile.department.name if profile.department else None,
            'course': profile.course.name if profile.course else None,
            'semester': profile.current_semester,
            'cgpa': profile.cgpa,
            'skills_count': len(profile.student_skills),
            'interests_count': len(profile.student_interests)
        }
    }), 200
