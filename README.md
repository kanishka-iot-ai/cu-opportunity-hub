# CU OPPORTUNITY HUB – Academic Opportunity Tracker
### Chandigarh University (Gharuan, Mohali, Punjab)
**NAAC Grade A+ Accredited Institution**

---

## 📌 Project Overview
**CU Opportunity Hub** is a centralized, database-driven academic opportunity management platform specifically tailored for students and faculty of **Chandigarh University**. 

It eliminates information fragmentation across scattered notices, department WhatsApp groups, and external portals by organizing all academic events, internships, hackathons, and research grants into one unified system with personalized AI-powered matching, visual deadline alerts, and an end-to-end 10-stage application tracking workflow.

---

## 🛠️ Technology Stack
* **Frontend:** React 19, Vite 6, Tailwind CSS, Lucide React Icons, Recharts (Data Visualizations)
* **Backend:** Python 3.14+, Flask REST API, Flask-JWT-Extended, Flask-CORS, SQLAlchemy ORM
* **Database:** MySQL 8.0+ (Production) with zero-configuration SQLite 3.x development fallback
* **Architecture:** Decoupled RESTful Client-Server, 3NF-Normalized Relational Database (18 entities), Cryptographic PBKDF2/scrypt Password Hashing, JWT Session Authentication

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
* Python 3.10+ (Tested on Python 3.14.6)
* Node.js v18+ (Tested on Node.js v24.18.0) & npm

### 1. Backend Setup
```bash
# 1. Navigate to project root
cd "campus opprotunity"

# 2. Activate Python virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install dependencies (if not already installed)
pip install -r backend/requirements.txt

# 4. Initialize & seed database with authentic Chandigarh University sample data
python backend/seed.py

# 5. Start Flask Backend Server (Runs on http://127.0.0.1:5000)
python backend/run.py
```

### 2. Frontend Setup
```bash
# In a new terminal window:
cd frontend

# Install npm packages (if needed)
npm install --legacy-peer-deps

# Start Vite React Development Server (Runs on http://127.0.0.1:3000)
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🔑 Demonstration Accounts

| Role | Username / UID | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | `25BIT10180` | `25bit10180@cuchd.in` | `student123` |
| **Faculty Coordinator** | `FAC_CSE01` | `faculty.cse@cuchd.in` | `faculty123` |
| **Administrator** | `ADMIN001` | `admin@cuchd.in` | `admin123` |

*Note: The login screen also features instant "Quick Demo" buttons for fast evaluation during practical examinations.*

---

## 🌟 Core Features & Modules

### 1. Institutional Authentication
* Dual-identifier login: Accepts either **Student UID** (`25BIT10180`) or **College Mail** (`25bit10180@cuchd.in`).
* Student registration with automatic Chandigarh University email derivation, department selection, degree course, semester, and CGPA.

### 2. Student Dashboard
* Personalized welcome header with student UID, semester, department, and CGPA.
* **6 Live Metric Cards:** Total available, new opportunities, saved items, tracked applications, urgent deadlines, and selections.
* **Color-coded Deadline Indicators:**
  * 🔴 **Red:** Less than 3 days remaining (*Critical*)
  * 🟡 **Yellow:** 3 to 7 days remaining (*Warning*)
  * 🟢 **Green:** More than 7 days remaining (*Normal*)
  * ⚪ **Grey:** Expired

### 3. Transparent 100-Point Recommendation Engine
* Mathematical formula:
  * Department Match: **25 pts**
  * Course / Degree Match: **20 pts**
  * Technical Skills Match: **25 pts**
  * Semester Timing: **15 pts**
  * Category Interests: **15 pts**
  * **Total: 100 pts**
* Clear eligibility labels: `Eligible`, `Potentially Eligible`, `Not Eligible`, `Insufficient Info`.
* Modal breakdown with reasons why each opportunity was recommended.

### 4. Opportunity Explorer (All 20 Categories)
1. Internships
2. Scholarships
3. Hackathons
4. Coding Competitions
5. Research Opportunities
6. Research Papers and Publications
7. Workshops
8. Seminars
9. Conferences
10. Student Exchange Programs
11. Study Abroad Programs
12. Government Opportunities
13. Fellowships
14. Innovation Challenges
15. Entrepreneurship Programs
16. Placement Opportunities
17. Campus Recruitment Drives
18. Online Certifications
19. Industrial Training
20. Academic Events

### 5. Personal Application Lifecycle Tracker (10 Stages)
* Stages: `Interested`, `Saved`, `Planning to Apply`, `Applied`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`, `Withdrawn`.
* Tracks personal notes, follow-up dates, and interview schedules.
* Complete transition history timeline with timestamped audit records.

### 6. Notifications & Deadline Scanner
* In-app notification center with unread counter.
* Automatic scanner for opportunities closing within 7 days, 3 days, and 24 hours.
* Personal task and study reminders.

### 7. Administrative & Faculty Portals
* Interactive Recharts visualizations: Category distribution, department participation bar charts, application success rates.
* Full CRUD on opportunities.
* Approval workflow for faculty-submitted opportunities.
* User account management with instant activate/deactivate controls.
* Official departmental announcement publishing.

---

## 🧪 Automated Testing
Run the backend test suite:
```bash
# Windows:
$env:PYTHONPATH='backend'; .\venv\Scripts\python.exe -m pytest backend/tests

# Linux/macOS:
PYTHONPATH=backend pytest backend/tests
```
All 12 automated unit and integration tests verify authentication, registration resilience, multi-criteria filtering, recommendation mathematics, and application tracking.

---

## 🌐 Vercel & Production Deployment

CU Opportunity Hub is configured out-of-the-box for **Full-Stack Vercel Deployment** using `vercel.json`:
* **Frontend:** Static build using Vite (`frontend/dist`)
* **Backend:** Serverless Python WSGI handler (`api/index.py` at `/api/*`) with automated cold-start database creation and seeding.

### Deploy to Vercel via GitHub:
1. Create a repository on GitHub (e.g., `cu-opportunity-hub`).
2. Push your code:
   ```bash
   git remote add origin https://github.com/<your-username>/cu-opportunity-hub.git
   git branch -M main
   git push -u origin main
   ```
3. Import the repository in [Vercel Dashboard](https://vercel.com/new).
4. Vercel automatically detects `vercel.json` and builds both frontend and backend.
5. (Optional) In Vercel Environment Variables, provide your cloud database URL (`DATABASE_URL=mysql+pymysql://...` or PostgreSQL). If omitted, an auto-seeded SQLite database is dynamically initialized in `/tmp`.

---

## 📁 Project Directory Structure
```
campus opprotunity/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory, CORS, JWT
│   │   ├── config.py             # Config & database paths
│   │   ├── models/               # SQLAlchemy ORM relational models
│   │   │   ├── user.py           # User, StudentProfile, Faculty, Dept, Course, Skills
│   │   │   ├── opportunity.py    # Opportunity, Category, OpportunitySkill, Saved
│   │   │   ├── application.py    # Application (10 stages), StatusHistory
│   │   │   └── notification.py   # Notification, Reminder, Announcement, AuditLog
│   │   ├── routes/               # REST API blueprints
│   │   │   ├── auth.py
│   │   │   ├── opportunities.py
│   │   │   ├── applications.py
│   │   │   ├── recommendations.py
│   │   │   ├── notifications.py
│   │   │   ├── admin.py
│   │   │   └── faculty.py
│   │   ├── services/             # Recommendation & notification algorithms
│   │   └── utils/                # Role-based decorators
│   ├── tests/                    # Automated pytest suite
│   ├── requirements.txt
│   ├── seed.py                   # Master database seed runner
│   └── run.py                    # Server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, OpportunityCard, Badges, Modals
│   │   ├── context/              # AuthContext & token management
│   │   ├── pages/                # Dashboard, Explorer, Detail, Tracker, Admin, etc.
│   │   ├── services/api.js       # Centralized REST client
│   │   ├── App.jsx               # Master application layout
│   │   └── index.css             # Tailwind CSS & theme tokens
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql                # Complete SQL relational schema
│   ├── seed_data.sql             # SQL seed records
│   ├── cu_opportunity_hub.db     # Populated SQLite database
│   └── er_diagram.md             # Mermaid ER diagram & normalization guide
├── docs/
│   ├── architecture.md           # System architecture & algorithms
│   ├── api_documentation.md      # Full REST API specifications
│   └── practical_exam_demo_guide.md # Viva evaluation presentation script
├── .env.example
└── README.md
```
