-- ==============================================================================
-- CU OPPORTUNITY HUB – SEED DATA FOR CHANDIGARH UNIVERSITY
-- Compatible with MySQL 8.0+ and SQLite
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, code, name, institute) VALUES
(1, 'UIE-CSE', 'University Institute of Engineering - Computer Science', 'University Institute of Engineering (UIE)'),
(2, 'AIT-CSE', 'Apex Institute of Technology - Computer Science & AI', 'Apex Institute of Technology (AIT)'),
(3, 'UIC', 'University Institute of Computing (BCA & MCA)', 'University Institute of Computing (UIC)'),
(4, 'USB', 'University School of Business', 'University School of Business (USB)'),
(5, 'UIBT', 'University Institute of Biotechnology', 'University Institute of Biotechnology (UIBT)'),
(6, 'UIE-ME', 'University Institute of Engineering - Mechanical', 'University Institute of Engineering (UIE)'),
(7, 'DCPD', 'Department of Career Planning & Development (TPP)', 'Chandigarh University Central Cell'),
(8, 'CU-TBI', 'Technology Business Incubator & Entrepreneurship Cell', 'Chandigarh University TBI');

-- 2. COURSES
INSERT INTO courses (id, department_id, code, name, degree_type, duration_years) VALUES
(1, 2, 'BTECH_IT', 'B.Tech Information Technology', 'Undergraduate', 4),
(2, 2, 'BTECH_AIML', 'B.Tech CSE (AI & Machine Learning)', 'Undergraduate', 4),
(3, 1, 'BTECH_CSE', 'B.Tech Computer Science & Engineering', 'Undergraduate', 4),
(4, 3, 'BCA', 'Bachelor of Computer Applications', 'Undergraduate', 3),
(5, 3, 'MCA', 'Master of Computer Applications', 'Postgraduate', 2),
(6, 4, 'MBA', 'Master of Business Administration', 'Postgraduate', 2),
(7, 5, 'BTECH_BIOTECH', 'B.Tech Biotechnology', 'Undergraduate', 4),
(8, 6, 'BTECH_ME', 'B.Tech Mechanical Engineering', 'Undergraduate', 4);

-- 3. CATEGORIES (All 20 Categories)
INSERT INTO categories (id, name, slug, description, icon_name) VALUES
(1, 'Internships', 'internships', 'Paid and academic summer/winter industrial internships', 'Briefcase'),
(2, 'Scholarships', 'scholarships', 'Merit and government academic scholarships and tuition fee waivers', 'GraduationCap'),
(3, 'Hackathons', 'hackathons', '24h/48h national and global hackathons and coding builds', 'Code'),
(4, 'Coding Competitions', 'coding-competitions', 'Competitive programming contests (LeetCode, CodeChef, ICPC)', 'Terminal'),
(5, 'Research Opportunities', 'research-opportunities', 'Undergraduate and postgraduate research assistantships with faculty labs', 'Microscope'),
(6, 'Research Papers and Publications', 'research-papers-publications', 'Call for papers, SCOPUS/IEEE indexed journal publications', 'FileText'),
(7, 'Workshops', 'workshops', 'Hands-on practical technical workshops and skill bootcamps', 'Wrench'),
(8, 'Seminars', 'seminars', 'Expert guest lectures by industry leaders and distinguished scholars', 'Users'),
(9, 'Conferences', 'conferences', 'National and international academic symposiums and summits', 'Globe'),
(10, 'Student Exchange Programs', 'student-exchange-programs', 'Semester abroad and credit-transfer bilateral exchange programs', 'Plane'),
(11, 'Study Abroad Programs', 'study-abroad-programs', 'Higher education foreign university partnerships and degree pathways', 'Compass'),
(12, 'Government Opportunities', 'government-opportunities', 'Public sector research fellowships, DRDO/ISRO/NIC student cohorts', 'Landmark'),
(13, 'Fellowships', 'fellowships', 'Prestigious funded national and international student fellowships', 'Award'),
(14, 'Innovation Challenges', 'innovation-challenges', 'National design contests, Smart India Hackathon, patent grants', 'Lightbulb'),
(15, 'Entrepreneurship Programs', 'entrepreneurship-programs', 'CU-TBI startup incubation grants, angel pitch deck challenges', 'Rocket'),
(16, 'Placement Opportunities', 'placement-opportunities', 'Full-time graduate placement drives and career hiring corridors', 'TrendingUp'),
(17, 'Campus Recruitment Drives', 'campus-recruitment-drives', 'On-campus recruitment days by Tier-1 corporate partners', 'Building2'),
(18, 'Online Certifications', 'online-certifications', 'Subsidized Microsoft, AWS, Google Cloud, Coursera voucher drives', 'CheckCircle'),
(19, 'Industrial Training', 'industrial-training', 'Mandatory 6-month semester industrial training and co-ops', 'Cpu'),
(20, 'Academic Events', 'academic-events', 'Chandigarh University annual technical fest, symposiums and conclaves', 'Calendar');

-- 4. SKILLS
INSERT INTO skills (id, name, category) VALUES
(1, 'Python', 'Programming'),
(2, 'Machine Learning', 'AI & Data Science'),
(3, 'Full Stack Web Dev', 'Development'),
(4, 'React.js', 'Development'),
(5, 'Data Structures & Algorithms', 'Computer Science'),
(6, 'Cloud Computing (AWS/GCP)', 'Cloud & DevOps'),
(7, 'Cybersecurity & Ethical Hacking', 'Security'),
(8, 'SQL & Database Design', 'Data & Databases'),
(9, 'Docker & Kubernetes', 'DevOps'),
(10, 'Deep Learning & NLP', 'AI & Data Science'),
(11, 'Internet of Things (IoT)', 'Embedded Systems'),
(12, 'Research Methodology & Paper Writing', 'Academic Research'),
(13, 'AutoCAD & SolidWorks', 'Mechanical Design'),
(14, 'Financial Modeling & Analytics', 'Management & Finance'),
(15, 'Public Speaking & Technical Pitching', 'Soft Skills');
