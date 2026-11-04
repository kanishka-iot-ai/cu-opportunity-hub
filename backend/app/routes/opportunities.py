from datetime import date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Opportunity, Category, Department, Course, Skill, SavedOpportunity, Application, User, StudentProfile
from ..utils.auth_decorators import get_current_user

opportunities_bp = Blueprint('opportunities', __name__)

@opportunities_bp.route('', methods=['GET'])
def list_opportunities():
    """
    Explore opportunities with rich search and advanced filters:
    - Search: query (q) matches title, organization, description, skills
    - Category: category_id or slug
    - Department: department_id
    - Mode: Online, Offline, Hybrid
    - Is Paid: true / false
    - Min CGPA: float
    - Urgent: closing_soon (deadline <= 7 days)
    - Verification Status: Verified (default for public), or ALL for staff
    - Sort: 'newest', 'closing_soon', 'most_viewed', 'title'
    """
    user = get_current_user()
    current_user_id = user.id if user else None

    query = Opportunity.query

    # Public students only see verified opportunities by default
    v_status = request.args.get('verification_status')
    if v_status and v_status != 'ALL':
        query = query.filter(Opportunity.verification_status == v_status)
    else:
        # If user is not admin/faculty, default to Verified
        if not user or user.role == 'STUDENT':
            query = query.filter(Opportunity.verification_status == 'Verified')

    # Search query
    q = request.args.get('q', '').strip()
    if q:
        search_filter = (
            Opportunity.title.ilike(f"%{q}%") |
            Opportunity.organization.ilike(f"%{q}%") |
            Opportunity.short_description.ilike(f"%{q}%") |
            Opportunity.full_description.ilike(f"%{q}%") |
            Opportunity.eligibility_criteria.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)

    # Category filter
    category_id = request.args.get('category_id')
    category_slug = request.args.get('category_slug')
    if category_id:
        query = query.filter(Opportunity.category_id == int(category_id))
    elif category_slug:
        cat = Category.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter(Opportunity.category_id == cat.id)

    # Department filter (include opportunities open to ALL departments as well)
    dept_id = request.args.get('department_id')
    if dept_id:
        query = query.filter(
            (Opportunity.department_id == int(dept_id)) | (Opportunity.department_id.is_(None))
        )

    # Mode filter (Online, Offline, Hybrid)
    mode = request.args.get('mode')
    if mode and mode != 'ALL':
        query = query.filter(Opportunity.mode == mode)

    # Paid filter
    is_paid = request.args.get('is_paid')
    if is_paid is not None and is_paid != '':
        query = query.filter(Opportunity.is_paid == (is_paid.lower() == 'true' or is_paid == '1'))

    # Closing soon filter (within 7 days)
    closing_soon = request.args.get('closing_soon')
    today = date.today()
    if closing_soon and closing_soon.lower() == 'true':
        query = query.filter(
            Opportunity.application_deadline >= today,
            Opportunity.application_deadline <= date.fromordinal(today.toordinal() + 7)
        )

    # Active / expired filter
    status_filter = request.args.get('status')
    if status_filter == 'active':
        query = query.filter(Opportunity.application_deadline >= today)
    elif status_filter == 'expired':
        query = query.filter(Opportunity.application_deadline < today)

    # Sorting
    sort_by = request.args.get('sort_by', 'newest')
    if sort_by == 'closing_soon':
        query = query.order_by(Opportunity.application_deadline.asc())
    elif sort_by == 'most_viewed':
        query = query.order_by(Opportunity.views_count.desc())
    elif sort_by == 'title':
        query = query.order_by(Opportunity.title.asc())
    else: # newest
        query = query.order_by(Opportunity.published_date.desc(), Opportunity.id.desc())

    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 24))
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    # Fetch student saved IDs and applications if logged in
    saved_ids = set()
    app_status_map = {}
    if user and user.role == 'STUDENT':
        saved_records = SavedOpportunity.query.filter_by(user_id=user.id).all()
        saved_ids = {s.opportunity_id for s in saved_records}

        if user.student_profile:
            apps = Application.query.filter_by(student_id=user.student_profile.id).all()
            app_status_map = {a.opportunity_id: a.current_status for a in apps}

    items = []
    for opp in paginated.items:
        opp_dict = opp.to_dict()
        opp_dict['is_saved'] = opp.id in saved_ids
        opp_dict['user_application_status'] = app_status_map.get(opp.id)
        items.append(opp_dict)

    return jsonify({
        'opportunities': items,
        'total': paginated.total,
        'page': paginated.page,
        'pages': paginated.pages,
        'per_page': paginated.per_page
    }), 200


@opportunities_bp.route('/<int:id>', methods=['GET'])
def get_opportunity(id):
    """
    Fetch full opportunity details and increment view count.
    """
    opp = Opportunity.query.get_or_404(id)

    # Increment view count
    opp.views_count += 1
    db.session.commit()

    user = get_current_user()
    opp_dict = opp.to_dict(student_user_id=user.id if user else None)

    # Check student application status
    if user and user.role == 'STUDENT' and user.student_profile:
        app = Application.query.filter_by(
            student_id=user.student_profile.id,
            opportunity_id=opp.id
        ).first()
        if app:
            opp_dict['user_application_status'] = app.current_status
            opp_dict['user_application_id'] = app.id

    # Fetch related opportunities (same category, excluding current)
    related = Opportunity.query.filter(
        Opportunity.category_id == opp.category_id,
        Opportunity.id != opp.id,
        Opportunity.verification_status == 'Verified',
        Opportunity.application_deadline >= date.today()
    ).limit(3).all()

    opp_dict['related_opportunities'] = [
        {
            'id': r.id,
            'title': r.title,
            'organization': r.organization,
            'application_deadline': r.application_deadline.isoformat(),
            'days_remaining': r.days_remaining,
            'deadline_urgency': r.deadline_urgency,
            'is_paid': r.is_paid,
            'mode': r.mode
        } for r in related
    ]

    return jsonify({'opportunity': opp_dict}), 200


@opportunities_bp.route('/<int:id>/save', methods=['POST'])
@jwt_required()
def toggle_save_opportunity(id):
    """
    Toggle saving/bookmarking an opportunity for a student.
    """
    user_id = get_jwt_identity()
    opp = Opportunity.query.get_or_404(id)

    saved = SavedOpportunity.query.filter_by(user_id=user_id, opportunity_id=opp.id).first()
    if saved:
        db.session.delete(saved)
        db.session.commit()
        return jsonify({'message': 'Opportunity removed from saved list', 'is_saved': False}), 200
    else:
        new_save = SavedOpportunity(user_id=user_id, opportunity_id=opp.id)
        db.session.add(new_save)
        db.session.commit()
        return jsonify({'message': 'Opportunity saved successfully', 'is_saved': True}), 201


@opportunities_bp.route('/saved', methods=['GET'])
@jwt_required()
def list_saved_opportunities():
    """
    List all opportunities saved by the currently logged in student.
    """
    user_id = get_jwt_identity()
    saved_records = SavedOpportunity.query.filter_by(user_id=user_id).order_by(SavedOpportunity.created_at.desc()).all()

    user = User.query.get(user_id)
    app_status_map = {}
    if user and user.student_profile:
        apps = Application.query.filter_by(student_id=user.student_profile.id).all()
        app_status_map = {a.opportunity_id: a.current_status for a in apps}

    results = []
    for s in saved_records:
        opp = s.opportunity
        if opp:
            opp_dict = opp.to_dict()
            opp_dict['is_saved'] = True
            opp_dict['saved_at'] = s.created_at.isoformat()
            opp_dict['user_application_status'] = app_status_map.get(opp.id)
            results.append(opp_dict)

    return jsonify({'saved_opportunities': results, 'total': len(results)}), 200


@opportunities_bp.route('/meta/categories', methods=['GET'])
def get_categories():
    """
    List all 20 categories with active opportunity counts.
    """
    today = date.today()
    cats = Category.query.order_by(Category.name.asc()).all()
    results = []
    for c in cats:
        count = Opportunity.query.filter_by(category_id=c.id, verification_status='Verified')\
            .filter(Opportunity.application_deadline >= today).count()
        cat_dict = c.to_dict()
        cat_dict['active_count'] = count
        results.append(cat_dict)

    return jsonify({'categories': results}), 200


@opportunities_bp.route('/meta/departments', methods=['GET'])
def get_departments():
    """
    List all Chandigarh University departments and their degree programs.
    """
    depts = Department.query.order_by(Department.name.asc()).all()
    results = []
    for d in depts:
        d_dict = d.to_dict()
        d_dict['courses'] = [c.to_dict() for c in d.courses]
        results.append(d_dict)

    return jsonify({'departments': results}), 200


@opportunities_bp.route('/meta/skills', methods=['GET'])
def get_skills():
    """
    List all skills grouped by category.
    """
    skills = Skill.query.order_by(Skill.name.asc()).all()
    return jsonify({'skills': [s.to_dict() for s in skills]}), 200
