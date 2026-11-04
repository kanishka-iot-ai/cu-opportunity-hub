# CU OPPORTUNITY HUB – Practical Examination Demonstration Guide
**Project:** Academic Opportunity Tracker for Chandigarh University  
**Target Audience:** University Evaluators, Project Guides, Viva Examiners, and Student Developers  

---

## 1. Quick Demonstration Credentials

| Role | Username / UID | College Email | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `25BIT10180` | `25bit10180@cuchd.in` | `student123` | Demonstrates student dashboard, 10-stage tracker, match engine, and bookmarks. |
| **Faculty Coordinator** | `FAC_CSE01` | `faculty.cse@cuchd.in` | `faculty123` | Demonstrates departmental notice publishing & opportunity submissions. |
| **Administrator** | `ADMIN001` | `admin@cuchd.in` | `admin123` | Demonstrates approval workflow, user directory controls, and Recharts analytics. |

---

## 2. Recommended 7-Step Viva Demonstration Flow

### Step 1: Institutional Authentication (Dual UID / Email Support)
* Open browser at `http://localhost:3000`.
* Demonstrate signing in using **Student UID** (`25BIT10180`) and password `student123`.
* Show that login equally accepts **College Email** (`25bit10180@cuchd.in`).
* Highlight the quick demo selector buttons at the bottom of the login modal for instant examiner testing.

### Step 2: Student Dashboard & Visual Deadline Indicators
* Point out the **Personalized Welcome Banner** with student name, UID, Semester 4, and AIT-CSE department.
* Review the **6 Live Statistics Cards**: Total Available, New Opportunities, Saved Items, Active Applications, Approaching Deadlines, and Selections.
* Demonstrate the **Color-Coded Deadline Urgency Badges**:
  * 🔴 **Red Alert:** Less than 3 days remaining (e.g. *AWS Solutions Architect Voucher Drive* - 1 day left; *Google Summer Internship* - 2 days left).
  * 🟡 **Yellow Warning:** 3 to 7 days remaining (e.g. *Smart India Hackathon* - 5 days left).
  * 🟢 **Green Normal:** Over 7 days remaining.
  * ⚪ **Grey:** Expired opportunities.

### Step 3: Transparent 100-Point Recommendation Engine
* Click **Recommended For You** in the sidebar.
* Show the transparent match percentages (e.g. *Microsoft Imagine Cup* at 95% match).
* Click **"Why was this recommended?"** on any card:
  * Reveal the detailed modal with the exact 5-point mathematical breakdown:
    * Department (25 pts)
    * Course (20 pts)
    * Technical Skills (25 pts)
    * Semester Window (15 pts)
    * Category Interests (15 pts)
  * Explain how eligibility criteria strictly prevent ineligible students from receiving false positive recommendations.

### Step 4: Opportunity Explorer (20 Distinct Academic Categories)
* Navigate to **Explore Opportunities**.
* Demonstrate the horizontal filter bar featuring all **20 official categories** (Internships, Scholarships, Hackathons, Coding Competitions, Research, Fellowships, Study Abroad, Seminars, etc.).
* Test the search bar by typing `"Google"`, `"DRDO"`, or `"AI"`.
* Filter by **Mode** (`Online`, `Offline`, `Hybrid`) and toggle **Paid Only**.

### Step 5: Opportunity Detail & Authentic Redirection
* Open **Google Summer Internship 2026** or **DRDO Research Fellowship**.
* Review full institutional details: minimum CGPA (7.5), eligible degrees, stipend (₹1,25,000/mo), application procedure, and verified source provenance.
* Click **"APPLY ON OFFICIAL PORTAL"** to show that students are redirected to the authentic external portal without false claims of proxy submission.

### Step 6: 10-Stage Personal Application Lifecycle Tracker
* Click **"Add to Application Tracker"** or open **My Applications** from the sidebar.
* Demonstrate filtering applications across the **10 lifecycle stages**:
  `Interested` $\to$ `Saved` $\to$ `Planning to Apply` $\to$ `Applied` $\to$ `Under Review` $\to$ `Shortlisted` $\to$ `Interview Scheduled` $\to$ `Selected` $\to$ `Rejected` $\to$ `Withdrawn`.
* Click **"Update Status"** to transition an application (e.g. to *Interview Scheduled*), adding an interview datetime and notes.
* Click **"Timeline"** to demonstrate the immutable audit history of stage transitions.

### Step 7: Administrative Oversight & Recharts Analytics
* Log out and log in as **Administrator** (`admin@cuchd.in` / `admin123`).
* Show the interactive **Recharts Visualizations**:
  * Bar chart of opportunities across categories.
  * Department participation bar chart.
  * 10-stage application pipeline breakdown.
* Open **Opportunity Control**:
  * Show the master table with pending faculty approvals.
  * Approve or publish a new opportunity with full validation.
* Open **Student Directory**:
  * Demonstrate search, department filtering, and the instant account deactivation/activation toggle.
