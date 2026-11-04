-- ==============================================================================
-- CU OPPORTUNITY HUB – ACADEMIC OPPORTUNITY TRACKER
-- Institution: Chandigarh University (CU)
-- Relational Database Schema (MySQL 8.0+ / SQLite Compatible)
-- ==============================================================================

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    institute VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. COURSES
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    department_id INTEGER NOT NULL,
    code VARCHAR(40) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    degree_type VARCHAR(50) NOT NULL DEFAULT 'Undergraduate',
    duration_years INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- 3. USERS (Roles: STUDENT, ADMIN, FACULTY)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    uid VARCHAR(50) UNIQUE,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    department_id INTEGER,
    course_id INTEGER,
    current_semester INTEGER DEFAULT 1,
    academic_year VARCHAR(20) DEFAULT '2025-2026',
    cgpa FLOAT DEFAULT 0.0,
    phone VARCHAR(20),
    bio TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    resume_url VARCHAR(255),
    avatar_seed VARCHAR(50) DEFAULT 'cu_student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- 5. FACULTY PROFILES
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    department_id INTEGER,
    designation VARCHAR(100) DEFAULT 'Assistant Professor',
    cabin_number VARCHAR(50),
    office_hours VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 6. CATEGORIES (All 20 opportunity categories)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Award',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(60) DEFAULT 'Technical',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. STUDENT SKILLS (Many-to-Many)
CREATE TABLE IF NOT EXISTS student_skills (
    student_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    proficiency_level VARCHAR(30) DEFAULT 'Intermediate',
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 9. STUDENT INTERESTS (Many-to-Many)
CREATE TABLE IF NOT EXISTS student_interests (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    student_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, category_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 10. OPPORTUNITIES
CREATE TABLE IF NOT EXISTS opportunities (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    organization VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    department_id INTEGER,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    min_cgpa FLOAT DEFAULT 0.0,
    target_semesters VARCHAR(100) DEFAULT 'ALL',
    target_degrees VARCHAR(150) DEFAULT 'ALL',
    benefits TEXT,
    required_documents TEXT,
    application_procedure TEXT,
    official_url VARCHAR(500) NOT NULL,
    contact_email VARCHAR(120),
    location VARCHAR(150) DEFAULT 'Online',
    mode VARCHAR(30) DEFAULT 'Online',
    is_paid BOOLEAN DEFAULT 0,
    stipend_amount VARCHAR(120),
    published_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    verification_status VARCHAR(40) DEFAULT 'Verified',
    last_verified_date DATE,
    source_name VARCHAR(150) NOT NULL,
    created_by INTEGER,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 11. OPPORTUNITY SKILLS (Many-to-Many)
CREATE TABLE IF NOT EXISTS opportunity_skills (
    opportunity_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (opportunity_id, skill_id),
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 12. SAVED OPPORTUNITIES
CREATE TABLE IF NOT EXISTS saved_opportunities (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    opportunity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, opportunity_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

-- 13. APPLICATIONS (Personal Application Tracker)
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    student_id INTEGER NOT NULL,
    opportunity_id INTEGER NOT NULL,
    application_date DATE NOT NULL,
    current_status VARCHAR(40) NOT NULL DEFAULT 'Interested',
    personal_notes TEXT,
    follow_up_date DATE,
    interview_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, opportunity_id),
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

-- 14. APPLICATION STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS application_status_history (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    application_id INTEGER NOT NULL,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    remarks VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- 15. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'GENERAL',
    reference_id INTEGER,
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. REMINDERS
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    opportunity_id INTEGER,
    title VARCHAR(200) NOT NULL,
    reminder_date TIMESTAMP NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);

-- 17. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    department_id INTEGER,
    author_id INTEGER NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'ALL',
    is_pinned BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
CREATE INDEX idx_opportunities_category ON opportunities(category_id);
CREATE INDEX idx_opportunities_deadline ON opportunities(application_deadline);
CREATE INDEX idx_opportunities_department ON opportunities(department_id);
CREATE INDEX idx_opportunities_status ON opportunities(verification_status);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(current_status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_reminders_user ON reminders(user_id, is_completed);
