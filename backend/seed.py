"""
Database Seeder for CU OPPORTUNITY HUB
Chandigarh University Academic Opportunity Tracker

Generates realistic data for:
- Chandigarh University Departments & Courses
- All 20 Categories
- Academic and Technical Skills
- Preconfigured Accounts:
    * Student UID: 25BIT10180 (email: 25bit10180@cuchd.in / pass: student123)
    * Admin: admin@cuchd.in / pass: admin123
    * Faculty: faculty.cse@cuchd.in / pass: faculty123
- 25+ Realistic Opportunities across all 20 categories
- Applications with status tracking & status history
- Saved opportunities, Reminders, In-App Notifications, Announcements
"""

import os
from datetime import datetime, date, timedelta
from app import create_app, db
from app.models import (
    User, StudentProfile, FacultyProfile, Department, Course,
    Category, Skill, StudentSkill, StudentInterest, Opportunity,
    OpportunitySkill, SavedOpportunity, Application, ApplicationStatusHistory,
    Notification, Reminder, Announcement, AuditLog
)

app = create_app()

def seed_database():
    with app.app_context():
        print("🌱 Initializing Database Schema...")
        db.create_all()

        # Clear existing data safely
        print("🧹 Clearing existing data...")
        db.session.query(AuditLog).delete()
        db.session.query(Reminder).delete()
        db.session.query(Notification).delete()
        db.session.query(Announcement).delete()
        db.session.query(ApplicationStatusHistory).delete()
        db.session.query(Application).delete()
        db.session.query(SavedOpportunity).delete()
        db.session.query(OpportunitySkill).delete()
        db.session.query(Opportunity).delete()
        db.session.query(StudentInterest).delete()
        db.session.query(StudentSkill).delete()
        db.session.query(Skill).delete()
        db.session.query(Category).delete()
        db.session.query(StudentProfile).delete()
        db.session.query(FacultyProfile).delete()
        db.session.query(Course).delete()
        db.session.query(Department).delete()
        db.session.query(User).delete()
        db.session.commit()

        print("🏛️ Seeding Chandigarh University Departments...")
        departments_data = [
            {'code': 'UIE-CSE', 'name': 'University Institute of Engineering - Computer Science', 'institute': 'University Institute of Engineering (UIE)'},
            {'code': 'AIT-CSE', 'name': 'Apex Institute of Technology - Computer Science & AI', 'institute': 'Apex Institute of Technology (AIT)'},
            {'code': 'UIC', 'name': 'University Institute of Computing (BCA & MCA)', 'institute': 'University Institute of Computing (UIC)'},
            {'code': 'USB', 'name': 'University School of Business', 'institute': 'University School of Business (USB)'},
            {'code': 'UIBT', 'name': 'University Institute of Biotechnology', 'institute': 'University Institute of Biotechnology (UIBT)'},
            {'code': 'UIE-ME', 'name': 'University Institute of Engineering - Mechanical', 'institute': 'University Institute of Engineering (UIE)'},
            {'code': 'DCPD', 'name': 'Department of Career Planning & Development (TPP)', 'institute': 'Chandigarh University Central Cell'},
            {'code': 'CU-TBI', 'name': 'Technology Business Incubator & Entrepreneurship Cell', 'institute': 'Chandigarh University TBI'}
        ]
        dept_map = {}
        for d in departments_data:
            dept = Department(**d)
            db.session.add(dept)
            db.session.flush()
            dept_map[d['code']] = dept

        print("📚 Seeding Academic Degree Courses...")
        courses_data = [
            {'dept_code': 'AIT-CSE', 'code': 'BTECH_IT', 'name': 'B.Tech Information Technology', 'degree_type': 'Undergraduate', 'duration_years': 4},
            {'dept_code': 'AIT-CSE', 'code': 'BTECH_AIML', 'name': 'B.Tech CSE (AI & Machine Learning)', 'degree_type': 'Undergraduate', 'duration_years': 4},
            {'dept_code': 'UIE-CSE', 'code': 'BTECH_CSE', 'name': 'B.Tech Computer Science & Engineering', 'degree_type': 'Undergraduate', 'duration_years': 4},
            {'dept_code': 'UIC', 'code': 'BCA', 'name': 'Bachelor of Computer Applications', 'degree_type': 'Undergraduate', 'duration_years': 3},
            {'dept_code': 'UIC', 'code': 'MCA', 'name': 'Master of Computer Applications', 'degree_type': 'Postgraduate', 'duration_years': 2},
            {'dept_code': 'USB', 'code': 'MBA', 'name': 'Master of Business Administration', 'degree_type': 'Postgraduate', 'duration_years': 2},
            {'dept_code': 'UIBT', 'code': 'BTECH_BIOTECH', 'name': 'B.Tech Biotechnology', 'degree_type': 'Undergraduate', 'duration_years': 4},
            {'dept_code': 'UIE-ME', 'code': 'BTECH_ME', 'name': 'B.Tech Mechanical Engineering', 'degree_type': 'Undergraduate', 'duration_years': 4}
        ]
        course_map = {}
        for c in courses_data:
            dept = dept_map[c['dept_code']]
            course = Course(
                department_id=dept.id,
                code=c['code'],
                name=c['name'],
                degree_type=c['degree_type'],
                duration_years=c['duration_years']
            )
            db.session.add(course)
            db.session.flush()
            course_map[c['code']] = course

        print("🏷️ Seeding All 20 Opportunity Categories...")
        categories_data = [
            ('Internships', 'internships', 'Paid and academic summer/winter industrial internships', 'Briefcase'),
            ('Scholarships', 'scholarships', 'Merit and government academic scholarships and tuition fee waivers', 'GraduationCap'),
            ('Hackathons', 'hackathons', '24h/48h national and global hackathons and coding builds', 'Code'),
            ('Coding Competitions', 'coding-competitions', 'Competitive programming contests (LeetCode, CodeChef, ICPC)', 'Terminal'),
            ('Research Opportunities', 'research-opportunities', 'Undergraduate and postgraduate research assistantships with faculty labs', 'Microscope'),
            ('Research Papers and Publications', 'research-papers-publications', 'Call for papers, SCOPUS/IEEE indexed journal publications', 'FileText'),
            ('Workshops', 'workshops', 'Hands-on practical technical workshops and skill bootcamps', 'Wrench'),
            ('Seminars', 'seminars', 'Expert guest lectures by industry leaders and distinguished scholars', 'Users'),
            ('Conferences', 'conferences', 'National and international academic symposiums and summits', 'Globe'),
            ('Student Exchange Programs', 'student-exchange-programs', 'Semester abroad and credit-transfer bilateral exchange programs', 'Plane'),
            ('Study Abroad Programs', 'study-abroad-programs', 'Higher education foreign university partnerships and degree pathways', 'Compass'),
            ('Government Opportunities', 'government-opportunities', 'Public sector research fellowships, DRDO/ISRO/NIC student cohorts', 'Landmark'),
            ('Fellowships', 'fellowships', 'Prestigious funded national and international student fellowships', 'Award'),
            ('Innovation Challenges', 'innovation-challenges', 'National design contests, Smart India Hackathon, patent grants', 'Lightbulb'),
            ('Entrepreneurship Programs', 'entrepreneurship-programs', 'CU-TBI startup incubation grants, angel pitch deck challenges', 'Rocket'),
            ('Placement Opportunities', 'placement-opportunities', 'Full-time graduate placement drives and career hiring corridors', 'TrendingUp'),
            ('Campus Recruitment Drives', 'campus-recruitment-drives', 'On-campus recruitment days by Tier-1 corporate partners', 'Building2'),
            ('Online Certifications', 'online-certifications', 'Subsidized Microsoft, AWS, Google Cloud, Coursera voucher drives', 'CheckCircle'),
            ('Industrial Training', 'industrial-training', 'Mandatory 6-month semester industrial training and co-ops', 'Cpu'),
            ('Academic Events', 'academic-events', 'Chandigarh University annual technical fest, symposiums and conclaves', 'Calendar')
        ]
        category_map = {}
        for name, slug, desc, icon in categories_data:
            cat = Category(name=name, slug=slug, description=desc, icon_name=icon)
            db.session.add(cat)
            db.session.flush()
            category_map[slug] = cat

        print("⚡ Seeding Technical & Academic Skills...")
        skills_data = [
            ('Python', 'Programming'),
            ('Machine Learning', 'AI & Data Science'),
            ('Full Stack Web Dev', 'Development'),
            ('React.js', 'Development'),
            ('Data Structures & Algorithms', 'Computer Science'),
            ('Cloud Computing (AWS/GCP)', 'Cloud & DevOps'),
            ('Cybersecurity & Ethical Hacking', 'Security'),
            ('SQL & Database Design', 'Data & Databases'),
            ('Docker & Kubernetes', 'DevOps'),
            ('Deep Learning & NLP', 'AI & Data Science'),
            ('Internet of Things (IoT)', 'Embedded Systems'),
            ('Research Methodology & Paper Writing', 'Academic Research'),
            ('AutoCAD & SolidWorks', 'Mechanical Design'),
            ('Financial Modeling & Analytics', 'Management & Finance'),
            ('Public Speaking & Technical Pitching', 'Soft Skills')
        ]
        skill_map = {}
        for name, cat in skills_data:
            sk = Skill(name=name, category=cat)
            db.session.add(sk)
            db.session.flush()
            skill_map[name] = sk

        print("👤 Seeding System Users & Student Profiles...")
        # 1. Admin Account
        admin_user = User(
            uid='ADMIN001',
            email='admin@cuchd.in',
            full_name='CU Central Academic Administration',
            role='ADMIN',
            is_active=True
        )
        admin_user.set_password('admin123')
        db.session.add(admin_user)
        db.session.flush()

        # 2. Faculty Coordinator Account
        faculty_user = User(
            uid='FAC_CSE01',
            email='faculty.cse@cuchd.in',
            full_name='Dr. Harpreet Singh',
            role='FACULTY',
            is_active=True
        )
        faculty_user.set_password('faculty123')
        db.session.add(faculty_user)
        db.session.flush()

        faculty_profile = FacultyProfile(
            user_id=faculty_user.id,
            department_id=dept_map['AIT-CSE'].id,
            designation='Associate Professor & Department Opportunity Coordinator',
            cabin_number='Academic Block 3, Cabin 408',
            office_hours='Monday - Friday: 3:00 PM - 5:00 PM'
        )
        db.session.add(faculty_profile)

        # 3. Main Student Account: UID 25BIT10180 (email 25bit10180@cuchd.in)
        student_user = User(
            uid='25BIT10180',
            email='25bit10180@cuchd.in',
            full_name='Kanishka Giri',
            role='STUDENT',
            is_active=True
        )
        student_user.set_password('student123')
        db.session.add(student_user)
        db.session.flush()

        student_profile = StudentProfile(
            user_id=student_user.id,
            department_id=dept_map['AIT-CSE'].id,
            course_id=course_map['BTECH_IT'].id,
            current_semester=4,
            academic_year='2025-2026',
            cgpa=8.85,
            phone='+91 98765 43210',
            bio='Aspiring Software Engineer & AI Researcher at Chandigarh University. Passionate about Full Stack Development, Cloud Engineering, and Hackathons.',
            linkedin_url='https://linkedin.com/in/kanishka-giri',
            github_url='https://github.com/kanishka-giri',
            portfolio_url='https://kanishkagiri.dev',
            avatar_seed='kanishka_cu_25'
        )
        db.session.add(student_profile)
        db.session.flush()

        # Attach skills to student
        student_skills = ['Python', 'React.js', 'Machine Learning', 'Data Structures & Algorithms', 'Cloud Computing (AWS/GCP)', 'SQL & Database Design']
        for sname in student_skills:
            db.session.add(StudentSkill(student_id=student_profile.id, skill_id=skill_map[sname].id, proficiency_level='Advanced'))

        # Attach interests to student
        student_interests = ['hackathons', 'internships', 'research-opportunities', 'fellowships', 'coding-competitions']
        for cslug in student_interests:
            db.session.add(StudentInterest(student_id=student_profile.id, category_id=category_map[cslug].id))

        # 4. Secondary Student for demo analytics
        student2 = User(
            uid='23BCS10452',
            email='23bcs10452@cuchd.in',
            full_name='Aarav Sharma',
            role='STUDENT',
            is_active=True
        )
        student2.set_password('student123')
        db.session.add(student2)
        db.session.flush()

        student_profile2 = StudentProfile(
            user_id=student2.id,
            department_id=dept_map['UIE-CSE'].id,
            course_id=course_map['BTECH_CSE'].id,
            current_semester=6,
            academic_year='2025-2026',
            cgpa=9.12,
            phone='+91 98123 45678',
            bio='B.Tech CSE student specializing in Systems Programming and Competitive Coding.',
            avatar_seed='aarav_cu_23'
        )
        db.session.add(student_profile2)

        print("🎯 Seeding 25+ Verified Opportunities across all 20 categories...")
        today = date.today()

        opportunities_data = [
            {
                'title': 'Google Summer Internship 2026 – Software Engineering (India)',
                'slug': 'google-summer-internship-2026-swe-india',
                'organization': 'Google India',
                'category_slug': 'internships',
                'dept_code': None, # All departments
                'short_description': '10-to-12-week paid summer software engineering internship working on planetary-scale Google Cloud and Android systems.',
                'full_description': 'Join Google Bangalore/Hyderabad for our premier summer internship program. You will collaborate with elite engineering teams, solve complex algorithmic challenges, build distributed infrastructure, and gain mentorship from Google tech leads.',
                'eligibility_criteria': 'Enrolled in 2nd or 3rd year of B.Tech / BE / MCA / M.Tech in CS, IT, or related technical disciplines. Minimum CGPA of 7.5.',
                'min_cgpa': 7.5,
                'target_semesters': '4,5,6',
                'target_degrees': 'B.Tech, MCA, M.Tech',
                'benefits': 'Stipend ₹1,25,000/month, comprehensive travel allowance, free meals, high-end MacBook Pro hardware, and Pre-Placement Interview (PPI) consideration for full-time roles.',
                'required_documents': 'Updated Technical Resume, Chandigarh University Bona-fide Certificate, Grade transcripts till previous semester.',
                'application_procedure': 'Complete official application on Google Careers Portal with CU college email. Shortlisted candidates undergo 2 technical rounds on Data Structures & System Problem Solving.',
                'official_url': 'https://careers.google.com/students',
                'contact_email': 'cu-placements@cuchd.in',
                'location': 'Bangalore / Hyderabad',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': '₹1,25,000 / month',
                'published_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=2), # Urgent: Critical Red (2 days left)
                'verification_status': 'Verified',
                'source_name': 'Google University Relations & CU DCPD Cell',
                'created_by': admin_user.id,
                'skills': ['Python', 'Data Structures & Algorithms', 'Cloud Computing (AWS/GCP)']
            },
            {
                'title': 'Smart India Hackathon (SIH) 2026 – Chandigarh University Internal Screening',
                'slug': 'smart-india-hackathon-2026-cu-internal-screening',
                'organization': 'Ministry of Education (MoE) & AICTE',
                'category_slug': 'hackathons',
                'dept_code': None,
                'short_description': 'Internal college nomination round to select the top 30 student teams representing Chandigarh University at the national SIH grand finale.',
                'full_description': 'Smart India Hackathon is India\'s biggest nationwide initiative providing students a platform to solve pressing problems of ministries, departments, and leading industries. Top 30 teams from CU will receive official institutional funding, mentorship by incubation experts, and direct entry to the national rounds.',
                'eligibility_criteria': 'All Chandigarh University undergraduate and postgraduate students from any stream. Team size: Exactly 6 members with at least 1 female member.',
                'min_cgpa': 6.0,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': 'National Grand Finale Cash Prize ₹1,00,000 per problem statement, university duty leave, travel grant sponsored by CU, and certification from Government of India.',
                'required_documents': 'Team Pitch Presentation (PPT max 7 slides), Functional Architecture Diagram, CU Student ID Cards of all 6 members.',
                'application_procedure': 'Submit PPT on Chandigarh University Innovation Portal. Internal campus jury evaluation will be conducted in Block 3 Auditorium.',
                'official_url': 'https://www.sih.gov.in',
                'contact_email': 'sih.coordinators@cuchd.in',
                'location': 'Chandigarh University Campus, Mohali',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': '₹1,00,000 Grand Prize',
                'published_date': today - timedelta(days=8),
                'application_deadline': today + timedelta(days=5), # Warning: Yellow (5 days left)
                'verification_status': 'Verified',
                'source_name': 'CU DSW & AICTE Innovation Cell',
                'created_by': faculty_user.id,
                'skills': ['Full Stack Web Dev', 'Python', 'Machine Learning', 'Public Speaking & Technical Pitching']
            },
            {
                'title': 'Microsoft Imagine Cup 2026 – Global Student AI Championship',
                'slug': 'microsoft-imagine-cup-2026-global-student-ai-championship',
                'organization': 'Microsoft Corporation',
                'category_slug': 'innovation-challenges',
                'dept_code': 'AIT-CSE',
                'short_description': 'Global startup and AI competition for university students. Build cutting-edge AI solutions on Microsoft Azure and compete for $100,000 USD.',
                'full_description': 'The Microsoft Imagine Cup gives students the opportunity to bring their AI innovation to life using Azure OpenAI and GitHub Copilot. Receive up to $1,000 in Azure credits, mentorship from Microsoft founders, and pitch live to Microsoft executives.',
                'eligibility_criteria': 'Students aged 16+ enrolled at an accredited university. Teams of 1 to 4 members. Must utilize Microsoft Azure AI technologies.',
                'min_cgpa': 6.5,
                'target_semesters': '3,4,5,6,7,8',
                'target_degrees': 'B.Tech, BCA, MCA',
                'benefits': '$100,000 USD grand prize, exclusive mentorship session with Satya Nadella, global trip to Microsoft Seattle HQ.',
                'required_documents': 'Project proposal, 3-minute video pitch, GitHub repository with runnable prototype, Azure architecture overview.',
                'application_procedure': 'Register on Imagine Cup portal using student email ID ending in @cuchd.in to claim free Azure credits.',
                'official_url': 'https://imaginecup.microsoft.com',
                'contact_email': 'microsoft.studentpartners@cuchd.in',
                'location': 'Online & Seattle, USA',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': '$100,000 Prize Pool',
                'published_date': today - timedelta(days=12),
                'application_deadline': today + timedelta(days=18), # Normal: Green (> 7 days)
                'verification_status': 'Verified',
                'source_name': 'Microsoft Learn Student Ambassadors CU Chapter',
                'created_by': admin_user.id,
                'skills': ['Machine Learning', 'Deep Learning & NLP', 'Cloud Computing (AWS/GCP)', 'React.js']
            },
            {
                'title': 'DRDO Research Fellowship Internship (INMAS & CAIR Labs)',
                'slug': 'drdo-research-fellowship-internship-2026',
                'organization': 'Defence Research and Development Organisation (DRDO)',
                'category_slug': 'research-opportunities',
                'dept_code': 'AIT-CSE',
                'short_description': '6-month defence technology research internship in Artificial Intelligence, Cyber Intelligence, and Embedded Sensor Networks.',
                'full_description': 'DRDO invites high-performing engineering students from Chandigarh University to work as student researchers at the Centre for Artificial Intelligence and Robotics (CAIR) and Institute of Nuclear Medicine and Allied Sciences (INMAS). You will contribute to confidential defense simulation, autonomous robotics, and threat analysis platforms.',
                'eligibility_criteria': 'Indian Nationals only. Minimum 8.0 CGPA with no active backlogs. Clean disciplinary and background record.',
                'min_cgpa': 8.0,
                'target_semesters': '4,5,6,7',
                'target_degrees': 'B.Tech, M.Tech',
                'benefits': 'Government research stipend ₹25,000/month, official DRDO security clearance badge, published co-authorship in defense papers.',
                'required_documents': 'NOC from Chandigarh University HOD, Police Verification certificate, Detailed Resume, Grade Sheet.',
                'application_procedure': 'Submit hard copies to Dean Academics Office Block 3, accompanied by digital submission on RAC DRDO portal.',
                'official_url': 'https://www.drdo.gov.in',
                'contact_email': 'drdo.liaison@cuchd.in',
                'location': 'DRDO CAIR Lab, New Delhi / Chandigarh',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': '₹25,000 / month',
                'published_date': today - timedelta(days=4),
                'application_deadline': today + timedelta(days=14), # Normal: Green (14 days left)
                'verification_status': 'Verified',
                'source_name': 'CU Office of Research & Development',
                'created_by': faculty_user.id,
                'skills': ['Python', 'Cybersecurity & Ethical Hacking', 'Machine Learning', 'Research Methodology & Paper Writing']
            },
            {
                'title': 'Mitacs Globalink Research Internship – Canada 2026/27',
                'slug': 'mitacs-globalink-research-internship-canada-2026',
                'organization': 'Mitacs Canada & Global Affairs Canada',
                'category_slug': 'study-abroad-programs',
                'dept_code': None,
                'short_description': 'Fully funded 12-week summer research internship at top Canadian universities (UBC, McGill, University of Toronto, Waterloo).',
                'full_description': 'Spend 12 weeks from May to September in Canada conducting hands-on research under the supervision of esteemed Canadian university faculty members. Selected students receive complete coverage of international flights, housing, medical insurance, and research stipends.',
                'eligibility_criteria': 'Full-time undergraduate students currently in their penultimate year (4th or 6th semester). Minimum CGPA: 8.5 / 10.0.',
                'min_cgpa': 8.5,
                'target_semesters': '4,6',
                'target_degrees': 'B.Tech, B.Sc',
                'benefits': '100% fully funded: Return international flight tickets, $300 CAD weekly living stipend, university housing stipend, visa fees paid, Canadian industry networking.',
                'required_documents': 'English proficiency proof (or letter from CU registrar), 2 Letters of Recommendation from CU professors, Academic Transcript.',
                'application_procedure': 'Apply online via Globalink portal with CU endorsement letter issued by International Relations Office (IRO), Block 1.',
                'official_url': 'https://www.mitacs.ca/en/programs/globalink/globalink-research-internship',
                'contact_email': 'international.office@cuchd.in',
                'location': 'Toronto / Vancouver / Montreal, Canada',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': 'Fully Funded ($8,500 CAD Value)',
                'published_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=25), # Normal: Green
                'verification_status': 'Verified',
                'source_name': 'Chandigarh University International Relations Office (IRO)',
                'created_by': admin_user.id,
                'skills': ['Research Methodology & Paper Writing', 'Python', 'Machine Learning']
            },
            {
                'title': 'Amazon AWS Certified Cloud Solutions Architect – Voucher Drive 2026',
                'slug': 'aws-certified-solutions-architect-voucher-drive-2026',
                'organization': 'Amazon Web Services (AWS) Academy & CU',
                'category_slug': 'online-certifications',
                'dept_code': 'AIT-CSE',
                'short_description': '100% subsidized certification examination vouchers ($150 USD waived) for AWS Certified Cloud Practitioner & Solutions Architect Associate.',
                'full_description': 'Chandigarh University has partnered with AWS Academy to distribute 200 fully subsidized certification exam vouchers to students who successfully pass the mock practice assessments on Blackboard/CUIMS.',
                'eligibility_criteria': 'Active CU students who complete the AWS Cloud Foundations module on AWS Academy LMS with 80%+ score.',
                'min_cgpa': 7.0,
                'target_semesters': '3,4,5,6,7,8',
                'target_degrees': 'B.Tech, BCA, MCA',
                'benefits': '100% free Pearson VUE exam voucher (worth ₹13,000 INR), official AWS digital verifiable badge, priority placement in AWS hiring partners.',
                'required_documents': 'AWS Academy LMS Completion Certificate, CU Student UID card.',
                'application_procedure': 'Submit LMS completion score screenshot on CU Opportunity Hub. Vouchers are disbursed weekly on first-come-first-served basis.',
                'official_url': 'https://aws.amazon.com/training/awsacademy',
                'contact_email': 'cloud.academy@cuchd.in',
                'location': 'Online / Pearson VUE Center',
                'mode': 'Online',
                'is_paid': True,
                'stipend_amount': '100% Voucher Subsidy ($150 Value)',
                'published_date': today - timedelta(days=2),
                'application_deadline': today + timedelta(days=1), # Critical: Red (1 day left)
                'verification_status': 'Verified',
                'source_name': 'CU Cloud Computing Department & AWS Academy',
                'created_by': faculty_user.id,
                'skills': ['Cloud Computing (AWS/GCP)', 'Docker & Kubernetes']
            },
            {
                'title': 'Goldman Sachs Engineering Campus Hiring Program 2026',
                'slug': 'goldman-sachs-engineering-campus-hiring-program-2026',
                'organization': 'Goldman Sachs',
                'category_slug': 'campus-recruitment-drives',
                'dept_code': 'UIE-CSE',
                'short_description': 'Flagship campus recruitment drive offering Summer 2026 Analyst Internships & 2027 Full-Time Software Engineering roles.',
                'full_description': 'Goldman Sachs visits Chandigarh University for its annual campus recruitment drive. Looking for high-caliber problem solvers and software engineers to engineer critical financial market infrastructure.',
                'eligibility_criteria': 'Students graduating in 2026 or 2027. Minimum CGPA of 7.0. No active backlogs during the time of drive.',
                'min_cgpa': 7.0,
                'target_semesters': '4,5,6',
                'target_degrees': 'B.Tech, MCA',
                'benefits': 'Internship stipend ₹1,00,000/month. Full-time CTC package up to ₹24,00,000 - ₹32,00,000 LPA + relocation bonus.',
                'required_documents': 'CU TPP Placement Card, Resume in CU standard format, 10th/12th marksheets, Degree grade sheets.',
                'application_procedure': 'Register via CU DCPD placement portal and attempt HackerRank aptitude & coding assessment.',
                'official_url': 'https://www.goldmansachs.com/careers/students',
                'contact_email': 'tpp.cse@cuchd.in',
                'location': 'Chandigarh University Campus & Bangalore',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': '₹1,00,000 / month (FTE: ₹28 LPA)',
                'published_date': today - timedelta(days=6),
                'application_deadline': today + timedelta(days=4), # Yellow (4 days left)
                'verification_status': 'Verified',
                'source_name': 'Department of Career Planning & Development (DCPD)',
                'created_by': admin_user.id,
                'skills': ['Data Structures & Algorithms', 'Python', 'SQL & Database Design']
            },
            {
                'title': 'IEEE International Conference on Computing, Power and Communication Technologies (IC2PCT 2026)',
                'slug': 'ieee-ic2pct-conference-call-for-papers-2026',
                'organization': 'IEEE Delhi Section & Chandigarh University',
                'category_slug': 'conferences',
                'dept_code': None,
                'short_description': 'Call for research papers for IEEE IC2PCT 2026. All accepted and presented papers will be submitted for inclusion into IEEE Xplore digital library.',
                'full_description': 'Chandigarh University is proud to host the 7th IEEE International Conference on Computing, Power and Communication Technologies. We invite original research submissions from undergraduate researchers and faculty.',
                'eligibility_criteria': 'Original unpublished research papers. Plagiarism must be under 15% (Turnitin verified). Must adhere to IEEE 2-column format.',
                'min_cgpa': 0.0,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': 'Publication in IEEE Xplore (SCOPUS Indexed), best student paper cash prize ₹15,000, citation boost.',
                'required_documents': 'IEEE double-column PDF paper (max 6 pages), similarity report, author copyright declaration form.',
                'application_procedure': 'Submit manuscript through Microsoft CMT conference portal.',
                'official_url': 'https://www.cuchd.in/research/conferences',
                'contact_email': 'ic2pct@cuchd.in',
                'location': 'Chandigarh University Auditorium Block 9',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': '₹15,000 Best Paper Award',
                'published_date': today - timedelta(days=15),
                'application_deadline': today + timedelta(days=22), # Normal: Green
                'verification_status': 'Verified',
                'source_name': 'Chandigarh University IEEE Student Branch',
                'created_by': faculty_user.id,
                'skills': ['Research Methodology & Paper Writing', 'Deep Learning & NLP', 'Machine Learning']
            },
            {
                'title': 'CU-TBI Startup Seed Fund & Incubation Cohort 2026',
                'slug': 'cu-tbi-startup-seed-fund-incubation-cohort-2026',
                'organization': 'Chandigarh University Technology Business Incubator (CU-TBI)',
                'category_slug': 'entrepreneurship-programs',
                'dept_code': 'CU-TBI',
                'short_description': 'Up to ₹10 Lakhs equity-free government seed funding, free dedicated co-working space, and intellectual property/patent registration support.',
                'full_description': 'Are you building a hardware, software, or bio-tech startup? CU-TBI under the aegis of Department of Science & Technology (DST), Govt of India invites innovative student startups for its Summer 2026 cohort.',
                'eligibility_criteria': 'At least one founder must be a current student or recent alumnus of Chandigarh University. Product must have a working MVP or proof of concept.',
                'min_cgpa': 0.0,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': 'Up to ₹10,00,000 INR non-dilutive grant, free AC office in CU Tech Park, free AWS/Azure cloud credits, legal incorporation support.',
                'required_documents': 'Executive pitch deck (10 slides), 2-minute demo video of prototype, financial projection worksheet.',
                'application_procedure': 'Submit proposal on CU-TBI portal. Shortlisted startups will pitch before angel investors in the CU Boardroom.',
                'official_url': 'https://www.cutbi.in',
                'contact_email': 'incubation@cuchd.in',
                'location': 'CU Technology Business Incubator, Block 6',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': 'Up to ₹10,00,000 Seed Grant',
                'published_date': today - timedelta(days=14),
                'application_deadline': today + timedelta(days=12), # Green
                'verification_status': 'Verified',
                'source_name': 'CU-TBI & DST Government of India',
                'created_by': admin_user.id,
                'skills': ['Financial Modeling & Analytics', 'Public Speaking & Technical Pitching', 'Full Stack Web Dev']
            },
            {
                'title': 'Post-Matric National Scholarship Scheme (NSP) – Punjab & Central 2026',
                'slug': 'national-scholarship-scheme-punjab-central-2026',
                'organization': 'Ministry of Electronics and Information Technology (MeitY)',
                'category_slug': 'scholarships',
                'dept_code': None,
                'short_description': 'Full academic tuition fee reimbursement and annual maintenance allowance for eligible undergraduate and postgraduate scholars.',
                'full_description': 'Government of India and Government of Punjab invite applications on the National Scholarship Portal (NSP) for university scholars. Chandigarh University scholarship verification cell assists in instant online institutional KYC authentication.',
                'eligibility_criteria': 'Annual family income less than ₹2.5 Lakhs per annum. Minimum 60% in qualifying senior secondary examination.',
                'min_cgpa': 6.0,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': '100% academic tuition fee waiver + ₹12,000 annual textbook and hostel allowance deposited directly into student Aadhaar-linked bank account.',
                'required_documents': 'Income Certificate from Tehsildar, Caste/Category Certificate, 10th & 12th DMC, CU Fee Receipt, Bank Passbook copy.',
                'application_procedure': 'Register on NSP portal (scholarships.gov.in) with CU Institute Code C-10180. Submit printout copy to Student Welfare Block.',
                'official_url': 'https://scholarships.gov.in',
                'contact_email': 'scholarships@cuchd.in',
                'location': 'Online Portal & CU Accounts Branch',
                'mode': 'Online',
                'is_paid': True,
                'stipend_amount': '100% Tuition Fee Reimbursement',
                'published_date': today - timedelta(days=20),
                'application_deadline': today + timedelta(days=3), # Critical: Red (3 days left)
                'verification_status': 'Verified',
                'source_name': 'National Scholarship Portal & CU Welfare Branch',
                'created_by': admin_user.id,
                'skills': ['Research Methodology & Paper Writing']
            },
            {
                'title': 'ACM ICPC 2026 Asia-Amritapuri Regional Preliminary Contest',
                'slug': 'acm-icpc-2026-regional-preliminary-contest',
                'organization': 'International Collegiate Programming Contest (ICPC) & ACM',
                'category_slug': 'coding-competitions',
                'dept_code': 'UIE-CSE',
                'short_description': 'The "Olympics of Competitive Programming". Represent Chandigarh University at the regional prelims.',
                'full_description': 'ICPC is the premier global competitive programming competition among universities of the world. Chandigarh University Coding Club organizes coach sponsorship, practice servers, and full travel subsidies for teams clearing the online preliminary round.',
                'eligibility_criteria': 'Teams of 3 students from the same university. Eligible under ICPC eligibility tree (enrolled within 4 years of secondary schooling).',
                'min_cgpa': 6.0,
                'target_semesters': 'ALL',
                'target_degrees': 'B.Tech, BCA, MCA',
                'benefits': 'Direct job offers from Citadel, Google, and Bloomberg for regional finalists; university medal and certificate of excellence.',
                'required_documents': 'ICPC Team profile, CU ID cards of all 3 teammates.',
                'application_procedure': 'Register on official ICPC Baylor site and designate Dr. Harpreet Singh as faculty mentor/coach.',
                'official_url': 'https://icpc.global',
                'contact_email': 'icpc.coordinator@cuchd.in',
                'location': 'Online Preliminary & Amritapuri Onsite',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': 'Fully Sponsored Travel & Medals',
                'published_date': today - timedelta(days=9),
                'application_deadline': today + timedelta(days=16), # Green
                'verification_status': 'Verified',
                'source_name': 'CU Competitive Programming Club',
                'created_by': faculty_user.id,
                'skills': ['Data Structures & Algorithms', 'Python']
            },
            {
                'title': 'Semester Abroad Bilateral Exchange – Curtin University (Australia)',
                'slug': 'semester-abroad-bilateral-exchange-curtin-university-australia',
                'organization': 'Curtin University (Perth, Australia) & CU IRO',
                'category_slug': 'student-exchange-programs',
                'dept_code': None,
                'short_description': 'Spend 1 full semester studying in Perth, Australia with zero international tuition fees under bilateral MOU.',
                'full_description': 'Experience international higher education at Curtin University, Australia. Students pay standard Chandigarh University semester fees and have Australian tuition fees completely waived. Academic credits are 100% transferred to your CU grade transcript.',
                'eligibility_criteria': 'Students currently in 3rd or 5th semester of study. Minimum CGPA of 8.0, with IELTS score >= 6.5 or CU English medium certification.',
                'min_cgpa': 8.0,
                'target_semesters': '3,4,5',
                'target_degrees': 'B.Tech, BBA, BCA',
                'benefits': 'Complete waiver of Australian international tuition fee (saves approx. $16,000 AUD), international campus life, global corporate exposure.',
                'required_documents': 'Statement of Purpose (SOP), 2 Faculty Recommendations, Valid Passport, All Semester Transcripts.',
                'application_procedure': 'Submit physical application dossier to Dean International Affairs, Block 1, Ground Floor.',
                'official_url': 'https://www.cuchd.in/international',
                'contact_email': 'exchange.curtin@cuchd.in',
                'location': 'Perth, Australia',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': 'Tuition Fee Waiver ($16,000 AUD Value)',
                'published_date': today - timedelta(days=11),
                'application_deadline': today + timedelta(days=30), # Green
                'verification_status': 'Verified',
                'source_name': 'Chandigarh University International Relations Office',
                'created_by': admin_user.id,
                'skills': ['Public Speaking & Technical Pitching']
            },
            {
                'title': 'ISRO Student Space Technology & Satellite Data Processing Workshop',
                'slug': 'isro-student-space-technology-workshop-2026',
                'organization': 'Indian Space Research Organisation (ISRO) & IIRS',
                'category_slug': 'workshops',
                'dept_code': None,
                'short_description': '5-day certified technical workshop on Remote Sensing, GIS, and Geospatial Deep Learning models hosted at CU Kalpana Chawla Space Center.',
                'full_description': 'The Kalpana Chawla Centre for Research in Space Science and Technology (KCCRSST) at Chandigarh University in collaboration with ISRO Indian Institute of Remote Sensing (IIRS) hosts a 5-day hands-on workshop on processing satellite raster data using Python and GDAL.',
                'eligibility_criteria': 'Open to engineering, computing, and applied science students with basic familiarity in Python programming.',
                'min_cgpa': 6.5,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': 'Official ISRO-IIRS Joint Certificate of Technical Competence, hands-on lab access to satellite ground station at CU.',
                'required_documents': 'CU Student ID Card.',
                'application_procedure': 'Register on IIRS outreach portal with coordinator code provided by CU Space Center.',
                'official_url': 'https://www.isro.gov.in',
                'contact_email': 'space.research@cuchd.in',
                'location': 'Kalpana Chawla Space Research Centre, CU Campus',
                'mode': 'Offline',
                'is_paid': False,
                'stipend_amount': 'Certified by ISRO',
                'published_date': today - timedelta(days=3),
                'application_deadline': today + timedelta(days=6), # Yellow (6 days left)
                'verification_status': 'Verified',
                'source_name': 'CU Kalpana Chawla Space Center & ISRO',
                'created_by': faculty_user.id,
                'skills': ['Python', 'Machine Learning', 'Research Methodology & Paper Writing']
            },
            {
                'title': 'NITI Aayog National Development Policy & AI Fellowship 2026',
                'slug': 'niti-aayog-national-development-policy-ai-fellowship-2026',
                'organization': 'NITI Aayog, Government of India',
                'category_slug': 'fellowships',
                'dept_code': None,
                'short_description': 'Prestigious policy and technical fellowship working directly with the Vice Chairman and Cabinet Advisor teams at New Delhi.',
                'full_description': 'NITI Aayog, the premier public policy think tank of the Government of India, offers undergraduate and postgraduate scholars an immersive 6-month fellowship to analyze governance data, evaluate digital public infrastructure, and design national AI governance frameworks.',
                'eligibility_criteria': 'Undergraduate and postgraduate students enrolled in recognized universities. Minimum CGPA of 8.2 or 75% aggregate marks.',
                'min_cgpa': 8.2,
                'target_semesters': '5,6,7,8',
                'target_degrees': 'B.Tech, MBA, MCA',
                'benefits': 'Government Fellow Honorarium ₹35,000/month, high-level interaction with Union Cabinet ministers, experience letter signed by CEO NITI Aayog.',
                'required_documents': 'Recommendation letter from CU Vice Chancellor, 1,000-word policy essay, detailed CV.',
                'application_procedure': 'Online submission through NITI Aayog internship portal between 1st and 10th of each calendar month.',
                'official_url': 'https://niti.gov.in/internship',
                'contact_email': 'fellowships.external@cuchd.in',
                'location': 'NITI Bhawan, Sansad Marg, New Delhi',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': '₹35,000 / month',
                'published_date': today - timedelta(days=7),
                'application_deadline': today + timedelta(days=10), # Green
                'verification_status': 'Verified',
                'source_name': 'NITI Aayog Public Outreach Cell',
                'created_by': admin_user.id,
                'skills': ['Research Methodology & Paper Writing', 'Public Speaking & Technical Pitching', 'Financial Modeling & Analytics']
            },
            {
                'title': 'TCS CodeVita Season 14 – Global Coding Contest & Fast-Track Interview Drive',
                'slug': 'tcs-codevita-season-14-global-coding-contest',
                'organization': 'Tata Consultancy Services (TCS)',
                'category_slug': 'coding-competitions',
                'dept_code': None,
                'short_description': 'Guinness World Record holder for the largest computer programming competition. Direct Digital and Prime job offers (up to ₹11.5 LPA).',
                'full_description': 'TCS CodeVita connects programming talent from across the globe. Clearing Round 1 with top ranking guarantees direct interview calls for the coveted TCS Digital (₹7.5 LPA) and TCS Prime (₹11.5 LPA) engineering roles without having to sit for standard campus written aptitude rounds.',
                'eligibility_criteria': 'Open to engineering and computing science students graduating in 2026, 2027, or 2028.',
                'min_cgpa': 6.0,
                'target_semesters': 'ALL',
                'target_degrees': 'B.Tech, BCA, MCA',
                'benefits': '$20,000 USD global prize pool, exemption from campus aptitude screening, immediate offer letter for top performers.',
                'required_documents': 'TCS NextStep CT/DT Reference Number, Chandigarh University Student UID.',
                'application_procedure': 'Register on TCS Campus Commune / NextStep with college designation "Chandigarh University, Mohali".',
                'official_url': 'https://campuscommune.tcs.com/en-in/intro/contests/codevita',
                'contact_email': 'tcs.placement@cuchd.in',
                'location': 'Online Assessment',
                'mode': 'Online',
                'is_paid': True,
                'stipend_amount': '$20,000 Prize + Job Offers',
                'published_date': today - timedelta(days=13),
                'application_deadline': today + timedelta(days=8), # Green
                'verification_status': 'Verified',
                'source_name': 'DCPD & TCS Campus Talent Acquisition',
                'created_by': admin_user.id,
                'skills': ['Data Structures & Algorithms', 'Python']
            },
            {
                'title': 'Chandigarh University CU-FEST 2026 – Annual National Tech Conclave',
                'slug': 'cu-fest-2026-annual-national-tech-conclave',
                'organization': 'Chandigarh University Student Welfare & Apex Institute',
                'category_slug': 'academic-events',
                'dept_code': None,
                'short_description': 'The flagship 3-day technical festival of Chandigarh University featuring 50+ project exhibitions, robotic wars, and hackathons.',
                'full_description': 'CU-Fest brings together over 10,000 students from across 200 premier Indian universities. Showcase your engineering capstone projects, participate in technical debate conclaves, LAN gaming, drone racing, and coding sprints.',
                'eligibility_criteria': 'Open to all current students of Chandigarh University. Valid CU student ID card required for event access.',
                'min_cgpa': 0.0,
                'target_semesters': 'ALL',
                'target_degrees': 'ALL',
                'benefits': 'Total prize pool exceeding ₹15,00,000 INR across all technical events, live concert access, participation certificates for all registered contestants.',
                'required_documents': 'CU Student Identity Card / CUIMS e-card.',
                'application_procedure': 'Register team on CU Fest portal or register at helpdesks located in Student Centre Block 1 & Block 3.',
                'official_url': 'https://www.cuchd.in/events',
                'contact_email': 'cufest.tech@cuchd.in',
                'location': 'Chandigarh University Sports Complex & Convention Hall',
                'mode': 'Offline',
                'is_paid': True,
                'stipend_amount': '₹15,00,000 Prize Pool',
                'published_date': today - timedelta(days=5),
                'application_deadline': today + timedelta(days=20), # Green
                'verification_status': 'Verified',
                'source_name': 'CU Department of Student Welfare (DSW)',
                'created_by': faculty_user.id,
                'skills': ['Public Speaking & Technical Pitching', 'Full Stack Web Dev', 'Robotics']
            },
            {
                'title': '6-Month Mandatory Industrial Training Drive – Tier-1 IT & Product Orgs',
                'slug': '6-month-mandatory-industrial-training-drive-2026',
                'organization': 'CU Corporate Relations & Industrial Tie-ups',
                'category_slug': 'industrial-training',
                'dept_code': 'AIT-CSE',
                'short_description': 'Official approval and allocation for mandatory 7th/8th semester live industrial training with verified tech partners.',
                'full_description': 'Students embarking on their mandatory 6-month industrial internship can choose between verified corporate partner allocations or submit external industry offer letters for instant academic clearance and credit mapping.',
                'eligibility_criteria': 'Students currently in 6th semester transitioning into 7th/8th semester. Must clear minimum 120 credit threshold.',
                'min_cgpa': 6.5,
                'target_semesters': '6,7,8',
                'target_degrees': 'B.Tech, MCA',
                'benefits': 'Full academic course exemption during training period, corporate stipend (₹20,000 - ₹60,000/mo), industry certificate.',
                'required_documents': 'Company Offer Letter, Industrial Training Confirmation Form signed by Company HR, CU NOC Request.',
                'application_procedure': 'Submit company details on CUIMS Training Portal and attend verification briefing with department training head.',
                'official_url': 'https://uims.cuchd.in',
                'contact_email': 'training.coordinator@cuchd.in',
                'location': 'Corporate Offices / Remote',
                'mode': 'Hybrid',
                'is_paid': True,
                'stipend_amount': '₹25,000 - ₹60,000 / month',
                'published_date': today - timedelta(days=10),
                'application_deadline': today + timedelta(days=28), # Green
                'verification_status': 'Verified',
                'source_name': 'CU Training & Placement Cell',
                'created_by': admin_user.id,
                'skills': ['Full Stack Web Dev', 'Python', 'React.js', 'SQL & Database Design']
            },
            {
                'title': 'Executive Guest Seminar: Generative AI & Frontier LLM Deployment',
                'slug': 'executive-guest-seminar-generative-ai-frontier-llm-deployment',
                'organization': 'NVIDIA Developer Relations & CU AI Club',
                'category_slug': 'seminars',
                'dept_code': 'AIT-CSE',
                'short_description': 'Distinguished tech seminar by NVIDIA Chief Solutions Architect on accelerating LLM fine-tuning and TensorRT deployment.',
                'full_description': 'Join us at the APJ Abdul Kalam Auditorium for a masterclass on enterprise generative AI architectures. Learn how frontier models are compressed, quantized to INT4 using TensorRT-LLM, and deployed with microsecond latency.',
                'eligibility_criteria': 'Open to all computing students and researchers at Chandigarh University.',
                'min_cgpa': 0.0,
                'target_semesters': 'ALL',
                'target_degrees': 'B.Tech, MCA, M.Tech',
                'benefits': 'Exclusive NVIDIA DLI Deep Learning Institute training vouchers, live interaction with senior NVIDIA scientists, certificate of attendance.',
                'required_documents': 'CU Student ID Card.',
                'application_procedure': 'Reserve seat on CU Opportunity Hub; entry badge generated on CUIMS.',
                'official_url': 'https://www.nvidia.com/en-in/deep-learning-ai',
                'contact_email': 'ai.seminars@cuchd.in',
                'location': 'APJ Abdul Kalam Auditorium, Block 3, CU',
                'mode': 'Offline',
                'is_paid': False,
                'stipend_amount': 'Free DLI Vouchers ($90 Value)',
                'published_date': today - timedelta(days=1),
                'application_deadline': today + timedelta(days=7), # Yellow (7 days left)
                'verification_status': 'Verified',
                'source_name': 'Apex Institute of Technology AI Department',
                'created_by': faculty_user.id,
                'skills': ['Machine Learning', 'Deep Learning & NLP', 'Python']
            }
        ]

        opp_map = {}
        for od in opportunities_data:
            cat = category_map[od['category_slug']]
            dept = dept_map[od['dept_code']] if od.get('dept_code') else None

            opp = Opportunity(
                title=od['title'],
                slug=od['slug'],
                organization=od['organization'],
                category_id=cat.id,
                department_id=dept.id if dept else None,
                short_description=od['short_description'],
                full_description=od['full_description'],
                eligibility_criteria=od['eligibility_criteria'],
                min_cgpa=od['min_cgpa'],
                target_semesters=od['target_semesters'],
                target_degrees=od['target_degrees'],
                benefits=od['benefits'],
                required_documents=od['required_documents'],
                application_procedure=od['application_procedure'],
                official_url=od['official_url'],
                contact_email=od['contact_email'],
                location=od['location'],
                mode=od['mode'],
                is_paid=od['is_paid'],
                stipend_amount=od['stipend_amount'],
                published_date=od['published_date'],
                application_deadline=od['application_deadline'],
                verification_status=od['verification_status'],
                last_verified_date=today,
                source_name=od['source_name'],
                created_by=od['created_by'],
                views_count=124
            )
            db.session.add(opp)
            db.session.flush()
            opp_map[od['slug']] = opp

            # Link skills
            for sk_name in od.get('skills', []):
                if sk_name in skill_map:
                    db.session.add(OpportunitySkill(opportunity_id=opp.id, skill_id=skill_map[sk_name].id))

        print("📋 Seeding Student Applications & Status History for UID 25BIT10180...")
        # 1. Google Internship: Applied -> Under Review
        google_opp = opp_map['google-summer-internship-2026-swe-india']
        app1 = Application(
            student_id=student_profile.id,
            opportunity_id=google_opp.id,
            application_date=today - timedelta(days=4),
            current_status='Under Review',
            personal_notes='Submitted resume through Google Careers with CU college email. Brushed up graphs and dynamic programming.',
            follow_up_date=today + timedelta(days=5),
            interview_date=None
        )
        db.session.add(app1)
        db.session.flush()
        db.session.add(ApplicationStatusHistory(application_id=app1.id, previous_status='Planning to Apply', new_status='Applied', remarks='Application submitted on Google portal'))
        db.session.add(ApplicationStatusHistory(application_id=app1.id, previous_status='Applied', new_status='Under Review', remarks='Recruiter confirmed initial resume screen pass'))

        # 2. Smart India Hackathon: Selected for Internal Screening
        sih_opp = opp_map['smart-india-hackathon-2026-cu-internal-screening']
        app2 = Application(
            student_id=student_profile.id,
            opportunity_id=sih_opp.id,
            application_date=today - timedelta(days=6),
            current_status='Shortlisted',
            personal_notes='Team "AlgoRiders" registered. Selected for round 2 live campus presentation in Block 3.',
            follow_up_date=today + timedelta(days=3),
            interview_date=datetime.utcnow() + timedelta(days=4, hours=3)
        )
        db.session.add(app2)
        db.session.flush()
        db.session.add(ApplicationStatusHistory(application_id=app2.id, previous_status=None, new_status='Applied', remarks='Submitted team pitch presentation'))
        db.session.add(ApplicationStatusHistory(application_id=app2.id, previous_status='Applied', new_status='Shortlisted', remarks='Selected among top 50 campus teams'))

        # 3. Goldman Sachs: Planning to Apply
        gs_opp = opp_map['goldman-sachs-engineering-campus-hiring-program-2026']
        app3 = Application(
            student_id=student_profile.id,
            opportunity_id=gs_opp.id,
            application_date=today - timedelta(days=2),
            current_status='Planning to Apply',
            personal_notes='Need to complete DCPD mock test on CUIMS before registering for HackerRank round.',
            follow_up_date=today + timedelta(days=2),
            interview_date=None
        )
        db.session.add(app3)
        db.session.flush()
        db.session.add(ApplicationStatusHistory(application_id=app3.id, previous_status=None, new_status='Planning to Apply', remarks='Saved to tracker'))

        print("⭐ Seeding Saved Opportunities...")
        saved_slugs = [
            'microsoft-imagine-cup-2026-global-student-ai-championship',
            'drdo-research-fellowship-internship-2026',
            'aws-certified-solutions-architect-voucher-drive-2026'
        ]
        for sslug in saved_slugs:
            if sslug in opp_map:
                db.session.add(SavedOpportunity(user_id=student_user.id, opportunity_id=opp_map[sslug].id))

        print("⏰ Seeding Reminders & Notifications...")
        db.session.add(Reminder(
            user_id=student_user.id,
            opportunity_id=google_opp.id,
            title='Review Google Interview Problem Set (Binary Trees & Trie)',
            reminder_date=datetime.utcnow() + timedelta(days=1),
            is_completed=False,
            notes='Practice 5 LeetCode Mediums on Trees and Graphs before recruiter follow up.'
        ))
        db.session.add(Reminder(
            user_id=student_user.id,
            opportunity_id=sih_opp.id,
            title='Finalize SIH PPT with Team AlgoRiders',
            reminder_date=datetime.utcnow() + timedelta(days=2),
            is_completed=False,
            notes='Check slide 4 architecture and prepare live web demo on laptop.'
        ))

        # In-app notifications
        db.session.add(Notification(
            user_id=student_user.id,
            title='⏳ Deadline Closing in 48h: Google Summer Internship 2026',
            message='The application window for Google Summer Internship 2026 closes in 2 days. Ensure your submission is completed on Google Careers.',
            notification_type='DEADLINE',
            reference_id=google_opp.id,
            reference_type='OPPORTUNITY',
            is_read=False
        ))
        db.session.add(Notification(
            user_id=student_user.id,
            title='🎯 Perfect Match: Microsoft Imagine Cup 2026 (95% Match)',
            message='A new competition matching your skills in Machine Learning, Python, and React.js is open for registration.',
            notification_type='OPPORTUNITY_MATCH',
            reference_id=opp_map['microsoft-imagine-cup-2026-global-student-ai-championship'].id,
            reference_type='OPPORTUNITY',
            is_read=False
        ))
        db.session.add(Notification(
            user_id=student_user.id,
            title='🎉 Status Update: SIH 2026 Campus Screening',
            message='Congratulations! Your team "AlgoRiders" has been Shortlisted for Round 2 in-person presentations.',
            notification_type='STATUS_UPDATE',
            reference_id=sih_opp.id,
            reference_type='APPLICATION',
            is_read=True
        ))

        print("📢 Seeding Departmental Announcements...")
        db.session.add(Announcement(
            title='Mandatory TPP Placement Orientation for 4th & 6th Semester Students',
            content='Department of Career Planning & Development (DCPD) is organizing a physical orientation in Block 3 Auditorium regarding Tier-1 corporate hiring cohorts, resume scoring on VMock, and technical practice benchmarks. Attendance is mandatory for all registered students.',
            department_id=dept_map['AIT-CSE'].id,
            author_id=faculty_user.id,
            target_audience='STUDENTS',
            is_pinned=True
        ))
        db.session.add(Announcement(
            title='Google Cloud & AWS Subsidized Examination Schedule Announced',
            content='Students who completed the cloud certification readiness modules on CUIMS can collect their Pearson VUE voucher codes from the Cloud Lab, 3rd Floor, Academic Block 3 starting this Wednesday.',
            department_id=None,
            author_id=admin_user.id,
            target_audience='ALL',
            is_pinned=False
        ))

        db.session.commit()
        print("✅ Database Seeding Completed Successfully!")
        print(f"👉 Student Login: UID '25BIT10180' or '25bit10180@cuchd.in' | Password: 'student123'")
        print(f"👉 Faculty Login: 'faculty.cse@cuchd.in' | Password: 'faculty123'")
        print(f"👉 Admin Login: 'admin@cuchd.in' | Password: 'admin123'")

if __name__ == '__main__':
    seed_database()
