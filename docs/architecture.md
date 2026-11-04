# CU OPPORTUNITY HUB – System Architecture Documentation
**Institution:** Chandigarh University (CU)  
**Author:** Academic Technology & Platform Engineering Team  

---

## 1. High-Level Architectural Overview

The application follows a modern decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND TIER                          │
│   React 19 + Vite 6 + Tailwind CSS + Lucide + Recharts      │
│   • Responsive Single Page Application                      │
│   • Real-Time Match Visualization & Color Urgency Badges   │
│   • Role-Based Views: Student / Faculty / Administrator     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND TIER                           │
│   Python Flask REST API + Flask-JWT-Extended + SQLAlchemy   │
│   • Authentication & Dual UID/Email Login Resolvers         │
│   • 100-Point Personalized Recommendation Scoring Engine    │
│   • 10-Stage Application Lifecycle State Machine            │
│   • Deadline Notification & Reminder Scanner                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Parameterized SQL / ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE TIER                          │
│   Relational RDBMS: MySQL 8.0+ / SQLite Development Fallback │
│   • 18 Normalized Tables (3NF Compliant)                    │
│   • Foreign Key Integrity & Cascade Rules                   │
│   • High-Performance B-Tree Indexes                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Student Identity Resolution

Chandigarh University students use a dual-identifier convention:
1. **Student UID:** e.g., `25BIT10180` (Year 25, BIT = Bachelor of Information Technology, Roll: 10180)
2. **College Mail:** `<uid>@cuchd.in` (e.g., `25bit10180@cuchd.in`)

### Dual Resolution Algorithm
* When a user submits credentials, the authentication controller normalizes the identifier:
  $$\text{Target} = \text{upper}(\text{identifier}) \quad \text{or} \quad \text{lower}(\text{identifier})$$
* It executes an OR-query across both indexed columns:
  ```sql
  SELECT * FROM users 
  WHERE UPPER(uid) = :id OR LOWER(email) = :id
  LIMIT 1;
  ```
* Passwords are verified using cryptographic hashing (`generate_password_hash` with PBKDF2/scrypt salts).
* Successful authentication generates a digitally signed JSON Web Token (JWT) with standard expiration.

---

## 3. Personalized Recommendation Engine

The recommendation engine scores each active opportunity for a student out of **100 total points**:

| Component | Max Points | Evaluation Logic |
| :--- | :---: | :--- |
| **Department Match** | **25 pts** | If opportunity is open university-wide (`department_id IS NULL`) or matches student's specific department. |
| **Course / Degree Match** | **20 pts** | Matches student's degree program (`B.Tech`, `BCA`, `MCA`, `MBA`) against targeted opportunity programs. |
| **Technical Skills Match** | **25 pts** | Jaccard-style competency overlap ratio between required opportunity skills and student's acquired skills. |
| **Semester Window** | **15 pts** | Evaluates student's current semester (e.g. 4th semester) against opportunity target semesters. |
| **Interests Match** | **15 pts** | Student's saved categories (e.g., Hackathons, Internships) vs opportunity category. |
| **Total Score** | **100 pts** | Sum of all 5 weighted components. |

### Eligibility Classification:
1. **ELIGIBLE:** Student meets all mandatory prerequisites (CGPA $\ge$ minimum, semester range aligned) and achieves score $\ge 60\%$.
2. **POTENTIALLY ELIGIBLE:** Marginal prerequisite gap (e.g., partial skills match or upcoming semester window) with score $\ge 35\%$.
3. **NOT ELIGIBLE:** Mandatory requirement violated (e.g. current CGPA < required CGPA, or restricted to another department).
4. **INSUFFICIENT INFO:** Incomplete student academic profile.

---

## 4. Application Lifecycle Tracker (10 Stages)

Students track each academic opportunity through 10 distinct operational states:
1. `Interested` $\to$ Marked as of prospective interest.
2. `Saved` $\to$ Bookmarked for upcoming review.
3. `Planning to Apply` $\to$ Preparing required documents (SOP, transcripts, resume).
4. `Applied` $\to$ Official application submitted on external employer/portal link.
5. `Under Review` $\to$ Employer / organizing committee reviewing profile.
6. `Shortlisted` $\to$ Cleared preliminary screening or online test.
7. `Interview Scheduled` $\to$ Date and time confirmed for technical interview / viva.
8. `Selected` $\to$ Formal selection letter / stipend awarded.
9. `Rejected` $\to$ Unsuccessful submission.
10. `Withdrawn` $\to$ Voluntarily canceled by student.

Every stage transition automatically writes an immutable record to `application_status_history` capturing timestamp, previous state, new state, and student remarks.

---

## 5. Security & Verification Guardrails

1. **Official Redirection:** The `APPLY NOW` button strictly routes students directly to the genuine external organization application portal (Google Careers, SIH, Mitacs, IEEE CMT). The system explicitly avoids deceptive claim of external proxy submission.
2. **Demonstration Integrity:** All seeded demonstration records are clearly annotated with source provenance and verified dates.
3. **Audit Trail:** Critical administrative and coordinator actions (opportunity approval, user status changes, posting notices) generate persistent entries in `audit_logs`.
