# CU OPPORTUNITY HUB – Database Architecture & Entity Relationship Diagram
**Institution:** Chandigarh University (CU)  
**RDBMS:** MySQL 8.0+ / SQLite 3.x (Development Fallback)  
**ORM:** SQLAlchemy (Python 3.14+)  

---

## 1. Visual Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    DEPARTMENTS ||--o{ COURSES : "offers"
    DEPARTMENTS ||--o{ STUDENT_PROFILES : "enrolls"
    DEPARTMENTS ||--o{ FACULTY_PROFILES : "employs"
    DEPARTMENTS ||--o{ OPPORTUNITIES : "targets / hosts"
    DEPARTMENTS ||--o{ ANNOUNCEMENTS : "issues"

    COURSES ||--o{ STUDENT_PROFILES : "pursues"

    USERS ||--|| STUDENT_PROFILES : "has profile"
    USERS ||--|| FACULTY_PROFILES : "has profile"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ REMINDERS : "sets"
    USERS ||--o{ SAVED_OPPORTUNITIES : "bookmarks"
    USERS ||--o{ AUDIT_LOGS : "triggers"
    USERS ||--o{ ANNOUNCEMENTS : "authors"
    USERS ||--o{ OPPORTUNITIES : "creates"

    CATEGORIES ||--o{ OPPORTUNITIES : "classifies"
    CATEGORIES ||--o{ STUDENT_INTERESTS : "interests"

    SKILLS ||--o{ STUDENT_SKILLS : "possessed by"
    SKILLS ||--o{ OPPORTUNITY_SKILLS : "demanded by"

    STUDENT_PROFILES ||--o{ STUDENT_SKILLS : "has"
    STUDENT_PROFILES ||--o{ STUDENT_INTERESTS : "prefers"
    STUDENT_PROFILES ||--o{ APPLICATIONS : "submits"

    OPPORTUNITIES ||--o{ OPPORTUNITY_SKILLS : "requires"
    OPPORTUNITIES ||--o{ SAVED_OPPORTUNITIES : "saved in"
    OPPORTUNITIES ||--o{ APPLICATIONS : "receives"
    OPPORTUNITIES ||--o{ REMINDERS : "scheduled on"

    APPLICATIONS ||--o{ APPLICATION_STATUS_HISTORY : "tracks transitions"

    USERS {
        int id PK
        string uid UK "e.g. 25BIT10180"
        string email UK "25bit10180@cuchd.in"
        string password_hash
        string full_name
        string role "STUDENT, ADMIN, FACULTY"
        boolean is_active
        datetime created_at
    }

    STUDENT_PROFILES {
        int id PK
        int user_id FK
        int department_id FK
        int course_id FK
        int current_semester
        string academic_year
        float cgpa
        string phone
        text bio
        string linkedin_url
        string github_url
    }

    DEPARTMENTS {
        int id PK
        string code UK "UIE-CSE, AIT-CSE, UIC, USB"
        string name
        string institute
    }

    COURSES {
        int id PK
        int department_id FK
        string code UK "BTECH_IT, BTECH_CSE, MCA"
        string name
        string degree_type
        int duration_years
    }

    CATEGORIES {
        int id PK
        string name UK "All 20 Categories"
        string slug UK
        string icon_name
    }

    OPPORTUNITIES {
        int id PK
        string title
        string slug UK
        string organization
        int category_id FK
        int department_id FK
        string mode "Online, Offline, Hybrid"
        boolean is_paid
        string stipend_amount
        date published_date
        date application_deadline
        string verification_status "Verified, Pending, Rejected, Expired"
        string official_url
        int views_count
    }

    APPLICATIONS {
        int id PK
        int student_id FK
        int opportunity_id FK
        date application_date
        string current_status "10 Standard Stages"
        text personal_notes
        date follow_up_date
        datetime interview_date
    }

    APPLICATION_STATUS_HISTORY {
        int id PK
        int application_id FK
        string previous_status
        string new_status
        string remarks
        datetime changed_at
    }

    REMINDERS {
        int id PK
        int user_id FK
        int opportunity_id FK
        string title
        datetime reminder_date
        boolean is_completed
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        string notification_type
        boolean is_read
    }
```

---

## 2. Normalization Analysis

### First Normal Form (1NF)
* Every table features an explicit primary key (`id` integer).
* Attribute values are atomic: multi-valued lists (such as student technical skills and target opportunity competencies) are normalized into associative relationship entities (`student_skills`, `opportunity_skills`, `student_interests`).

### Second Normal Form (2NF)
* All non-key attributes are fully functionally dependent on the complete primary key.
* Associative tables with composite keys (`student_id, skill_id` and `opportunity_id, skill_id`) depend solely on both composite columns.

### Third Normal Form (3NF)
* Non-key attributes depend strictly and directly on the primary key without transitive dependencies.
* Departmental and Course attributes exist in their respective parent entities (`departments`, `courses`) rather than redundantly copying institute names across student records or opportunity records.

---

## 3. High-Performance Indexing Strategy
To handle university-wide concurrency across tens of thousands of active students, key composite and single-column B-tree indexes are implemented:
* `idx_opportunities_deadline` (`application_deadline`): Instant filtering for closing-soon queries (< 7 days) and expired items.
* `idx_opportunities_category` (`category_id`): Rapid tab filtering across all 20 categories.
* `idx_applications_student` (`student_id`): Real-time retrieval of student application boards.
* `idx_notifications_user` (`user_id, is_read`): Zero-latency unread badge counts on navbar render.
