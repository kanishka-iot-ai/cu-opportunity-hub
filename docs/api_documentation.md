# CU OPPORTUNITY HUB – REST API Documentation
**Institution:** Chandigarh University  
**Base URL:** `http://127.0.0.1:5000/api`  
**Authentication Header:** `Authorization: Bearer <jwt_access_token>`  

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates a student, faculty coordinator, or administrator using either UID or Email.

* **Request Body:**
  ```json
  {
    "identifier": "25BIT10180", // or "25bit10180@cuchd.in"
    "password": "student123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "access_token": "eyJhbGciOi...",
    "user": {
      "id": 3,
      "uid": "25BIT10180",
      "email": "25bit10180@cuchd.in",
      "full_name": "Angel",
      "role": "STUDENT",
      "profile": { ... }
    }
  }
  ```

### `POST /api/auth/register`
Onboards a new Chandigarh University student.
* **Fields:** `uid`, `email` (auto-derived), `full_name`, `password`, `department_id`, `course_id`, `current_semester`, `cgpa`, `skill_ids`, `interest_category_ids`.

### `GET /api/auth/me`
Retrieves the profile and academic metrics for the currently authenticated user.

### `PUT /api/auth/profile`
Updates academic profile information (CGPA, semester, technical skills, interests, portfolio links).

---

## 2. Opportunities Endpoints (`/api/opportunities`)

### `GET /api/opportunities`
Retrieves paginated opportunities with search and multi-criteria filtering.
* **Query Parameters:**
  * `q` (string): Search in title, organization, description, skills.
  * `category_slug` (string): Filter by any of the 20 category slugs.
  * `department_id` (integer): Filter by department.
  * `mode` (string): `Online`, `Offline`, `Hybrid`.
  * `is_paid` (boolean): `true` or `false`.
  * `closing_soon` (boolean): Filters opportunities closing $\le 7$ days.
  * `sort_by` (string): `newest`, `closing_soon`, `most_viewed`, `title`.

### `GET /api/opportunities/<id>`
Retrieves full details for a single opportunity, increments its view counter, and checks the user's saved/application status.

### `POST /api/opportunities/<id>/save`
Toggles bookmark status of an opportunity for the logged-in student.

### `GET /api/opportunities/saved`
Lists all bookmarked opportunities for the student.

### `GET /api/opportunities/meta/categories`
Returns all 20 categories with active opportunity counters.

### `GET /api/opportunities/meta/departments`
Returns all Chandigarh University institutes and associated degree programs.

---

## 3. Applications Tracker Endpoints (`/api/applications`)

### `GET /api/applications`
Lists the student's tracked applications.
* **Query Parameters:** `status` (one of the 10 lifecycle stages), `q` (search term).

### `POST /api/applications`
Creates or updates a tracked application record.
* **Request Body:**
  ```json
  {
    "opportunity_id": 1,
    "status": "Under Review",
    "personal_notes": "Completed initial coding round.",
    "follow_up_date": "2026-11-15",
    "interview_date": "2026-11-18T10:00:00Z"
  }
  ```

### `PUT /api/applications/<id>`
Updates application status, scheduling notes, and automatically appends a transition audit record.

### `DELETE /api/applications/<id>`
Removes an opportunity from tracking.

---

## 4. Recommendation Engine (`/api/recommendations`)

### `GET /api/recommendations`
Runs the transparent 100-point matching formula for the student and returns opportunities ranked by compatibility.
* **Query Parameters:** `filter=all`, `filter=eligible_only`, `filter=high_match`.
* **Output includes:**
  * `score` (0–100%)
  * `eligibility_status` (`ELIGIBLE`, `POTENTIALLY_ELIGIBLE`, `NOT_ELIGIBLE`)
  * `breakdown`: Points for Department (25), Course (20), Skills (25), Semester (15), Interests (15).
  * `reasons`: Human-readable explanation bullets detailing why the match was generated.

---

## 5. Notifications & Reminders (`/api/notifications`)

* `GET /api/notifications` $\to$ Returns unread and historical in-app notifications.
* `PUT /api/notifications/<id>/read` $\to$ Marks single notification as read.
* `PUT /api/notifications/read-all` $\to$ Marks all as read.
* `POST /api/notifications/trigger-deadline-scan` $\to$ Scans active applications and fires alerts for deadlines within 7 days, 3 days, or 1 day.
* `GET /api/notifications/reminders` $\to$ Personal task reminders.
* `POST /api/notifications/reminders` $\to$ Create custom reminder.
* `PUT /api/notifications/reminders/<id>/toggle` $\to$ Toggle reminder done/pending.

---

## 6. Administrative & Faculty Endpoints

* `GET /api/admin/stats` $\to$ High-level university metrics, category distribution, department participation.
* `GET /api/admin/opportunities` $\to$ Master list of all opportunities including pending verification.
* `POST /api/admin/opportunities` $\to$ Publish opportunity.
* `PUT /api/admin/opportunities/<id>` $\to$ Edit opportunity.
* `PUT /api/admin/opportunities/<id>/verify` $\to$ Approve / Reject faculty-submitted opportunity.
* `DELETE /api/admin/opportunities/<id>` $\to$ Remove opportunity.
* `GET /api/admin/users` $\to$ Student & faculty directory with active status toggles.
* `GET /api/faculty/dashboard` $\to$ Department coordinator metrics.
* `POST /api/faculty/announcements` $\to$ Publish official departmental notice.
