"""
Personalized Recommendation Engine for CU Opportunity Hub
Chandigarh University Academic Opportunity Tracker

Formula (Total: 100 points):
- Department match: 25 points
- Course/Degree match: 20 points
- Skills match: 25 points
- Semester match: 15 points
- Category/Interests match: 15 points

Eligibility Status:
- 'ELIGIBLE': Student meets all mandatory criteria (CGPA, semester/degree) + score >= 50
- 'POTENTIALLY_ELIGIBLE': Minor gap (e.g. skills partial, or semester near border) + score >= 35
- 'NOT_ELIGIBLE': Mandatory criteria failed (e.g. student CGPA < min_cgpa, or excluded degree)
- 'INSUFFICIENT_INFO': Student profile missing department, course, or semester
"""

from typing import Dict, Any, List

def calculate_opportunity_recommendation(student_profile, opportunity) -> Dict[str, Any]:
    # Check if student profile is complete enough
    if not student_profile or not student_profile.department_id or not student_profile.current_semester:
        return {
            'score': 0,
            'match_percentage': 0,
            'eligibility_status': 'INSUFFICIENT_INFO',
            'eligibility_label': 'Insufficient Profile Information',
            'is_eligible': False,
            'breakdown': {
                'department_score': 0,
                'course_score': 0,
                'skills_score': 0,
                'semester_score': 0,
                'interest_score': 0,
                'max_score': 100
            },
            'reasons': ['Complete your academic profile (Department, Course, Semester) to receive personalized recommendations.']
        }

    department_score = 0
    course_score = 0
    skills_score = 0
    semester_score = 0
    interest_score = 0
    reasons: List[str] = []
    disqualifications: List[str] = []

    # 1. Department match (Max 25 pts)
    # If opportunity.department_id is None -> All Departments (Open to everyone: 25 pts)
    # If matches student's department -> Direct Departmental Opportunity (25 pts + highlighted)
    if opportunity.department_id is None:
        department_score = 25
        reasons.append("Open across all Chandigarh University departments.")
    elif opportunity.department_id == student_profile.department_id:
        department_score = 25
        dept_name = student_profile.department.code if student_profile.department else "your department"
        reasons.append(f"Exclusively tailored for {dept_name}.")
    else:
        department_score = 0
        disqualifications.append(f"Restricted to {opportunity.department.name if opportunity.department else 'another department'}.")

    # 2. Course / Degree match (Max 20 pts)
    target_degrees = (opportunity.target_degrees or 'ALL').upper()
    student_course_code = (student_profile.course.code if student_profile.course else '').upper()
    student_degree_type = (student_profile.course.degree_type if student_profile.course else '').upper()

    if target_degrees == 'ALL' or 'ALL' in target_degrees:
        course_score = 20
        reasons.append("Eligible for all academic degree programs.")
    else:
        # Check if student's course code or degree type is included in target_degrees
        is_degree_match = False
        if student_course_code and student_course_code in target_degrees:
            is_degree_match = True
        elif 'B.TECH' in target_degrees and 'BTECH' in student_course_code:
            is_degree_match = True
        elif 'BCA' in target_degrees and 'BCA' in student_course_code:
            is_degree_match = True
        elif 'MCA' in target_degrees and 'MCA' in student_course_code:
            is_degree_match = True
        elif 'MBA' in target_degrees and 'MBA' in student_course_code:
            is_degree_match = True
        elif student_degree_type and student_degree_type in target_degrees:
            is_degree_match = True

        if is_degree_match:
            course_score = 20
            reasons.append(f"Matches your program ({student_profile.course.name if student_profile.course else 'Course'}).")
        else:
            course_score = 5
            disqualifications.append(f"Targeted degree is {opportunity.target_degrees}.")

    # 3. Skills match (Max 25 pts)
    # Compare opportunity required skills with student skills
    opp_skill_ids = {os.skill_id for os in opportunity.skills}
    student_skill_ids = {ss.skill_id for ss in student_profile.student_skills}
    
    if not opp_skill_ids:
        # No specific technical skill required -> full points for general access
        skills_score = 25
        reasons.append("No specialized prerequisites required; open for learning.")
    else:
        matched_skills = opp_skill_ids.intersection(student_skill_ids)
        if matched_skills:
            match_ratio = len(matched_skills) / len(opp_skill_ids)
            skills_score = int(round(match_ratio * 25))
            matched_names = [os.skill.name for os in opportunity.skills if os.skill_id in matched_skills]
            reasons.append(f"You have {len(matched_skills)}/{len(opp_skill_ids)} required skills: {', '.join(matched_names[:3])}.")
        else:
            skills_score = 0
            unmatched_names = [os.skill.name for os in opportunity.skills if os.skill]
            if unmatched_names:
                reasons.append(f"Skills to develop: {', '.join(unmatched_names[:3])}.")

    # 4. Semester match (Max 15 pts)
    target_sems = (opportunity.target_semesters or 'ALL').upper()
    student_sem = student_profile.current_semester or 1

    if target_sems == 'ALL' or 'ALL' in target_sems:
        semester_score = 15
        reasons.append("Open to all semesters.")
    else:
        # e.g., "3,4,5,6" or "5,6,7,8"
        allowed_sems = [int(s.strip()) for s in target_sems.split(',') if s.strip().isdigit()]
        if student_sem in allowed_sems:
            semester_score = 15
            reasons.append(f"Perfect timing for your current Semester {student_sem}.")
        elif allowed_sems and any(abs(student_sem - s) == 1 for s in allowed_sems):
            semester_score = 7
            reasons.append(f"Close to your semester window (targeted: Sem {target_sems}).")
        else:
            semester_score = 0
            disqualifications.append(f"Target semester: {target_sems} (you are in Sem {student_sem}).")

    # 5. Student Interests / Category match (Max 15 pts)
    student_category_ids = {si.category_id for si in student_profile.student_interests}
    if not student_category_ids or opportunity.category_id in student_category_ids:
        interest_score = 15
        if opportunity.category_id in student_category_ids:
            reasons.append(f"Directly aligns with your saved interest in {opportunity.category.name if opportunity.category else 'this category'}.")
    else:
        interest_score = 5

    # Check Mandatory Eligibility Criteria:
    # 1. CGPA requirement
    cgpa_failed = False
    if opportunity.min_cgpa and opportunity.min_cgpa > 0:
        student_cgpa = student_profile.cgpa or 0.0
        if student_cgpa < opportunity.min_cgpa:
            cgpa_failed = True
            disqualifications.append(f"Requires minimum CGPA of {opportunity.min_cgpa:.1f} (your current CGPA is {student_cgpa:.2f}).")
        else:
            reasons.append(f"Your CGPA ({student_cgpa:.2f}) satisfies the minimum requirement of {opportunity.min_cgpa:.1f}.")

    # Calculate Total Score
    total_score = min(100, department_score + course_score + skills_score + semester_score + interest_score)

    # Determine Status
    if cgpa_failed or (opportunity.department_id and opportunity.department_id != student_profile.department_id):
        eligibility_status = 'NOT_ELIGIBLE'
        eligibility_label = 'Not Eligible'
        is_eligible = False
    elif total_score >= 60:
        eligibility_status = 'ELIGIBLE'
        eligibility_label = 'Eligible'
        is_eligible = True
    elif total_score >= 35:
        eligibility_status = 'POTENTIALLY_ELIGIBLE'
        eligibility_label = 'Potentially Eligible'
        is_eligible = True
    else:
        eligibility_status = 'NOT_ELIGIBLE'
        eligibility_label = 'Not Eligible'
        is_eligible = False

    return {
        'score': total_score,
        'match_percentage': total_score,
        'eligibility_status': eligibility_status,
        'eligibility_label': eligibility_label,
        'is_eligible': is_eligible,
        'breakdown': {
            'department_score': department_score,
            'course_score': course_score,
            'skills_score': skills_score,
            'semester_score': semester_score,
            'interest_score': interest_score,
            'max_score': 100
        },
        'reasons': reasons,
        'disqualifications': disqualifications
    }
