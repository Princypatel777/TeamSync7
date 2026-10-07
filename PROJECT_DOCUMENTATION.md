# TeamSync — SGP Project Management Platform
**Comprehensive Project Documentation**

## 1. Project Overview
TeamSync is a full-stack web application designed to streamline the management of Software Group Projects (SGP) in academic institutions. It provides dedicated portals for Students, Faculty (Guides), Project Coordinators, and System Administrators, allowing them to collaborate, track progress, review code, and manage grades all in one place.

### Technology Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Recharts (for analytics).
* **Backend:** Python, FastAPI, Beanie (MongoDB ODM), Pydantic, Motor (Async MongoDB Driver).
* **Database:** MongoDB.
* **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing.

---

## 2. Architecture & Data Flow
When a user interacts with the frontend, the following data flow occurs:
1. **User Action (Button/Text):** The user clicks a button or submits a form on the React frontend.
2. **API Call:** The frontend sends an asynchronous HTTP request (using `fetch` or `axios`) to the FastAPI backend (running on `localhost:5000/api/...`). The request includes a JWT Bearer token in the Authorization header.
3. **Backend Routing & Auth:** The FastAPI router receives the request, verifies the JWT token, and checks if the user has the required Role (e.g., `STUDENT` or `FACULTY`).
4. **Database Operation:** The router uses Beanie ODM to query or modify the MongoDB database. Data models are strictly validated using Pydantic (configured to seamlessly convert `camelCase` JSON requests to `snake_case` Python fields).
5. **Response:** The backend sends a JSON response back to the frontend, which updates the React state and re-renders the UI.

---

## 3. User Roles & Dashboards

### A. Student Portal
**Navigation & Features:**
* **Dashboard:** Shows a high-level overview of the student's project, upcoming deadlines, and recent notifications.
* **Group Management (`/student/group`):** 
  * **Data:** Displays group members, project guide, and group ID.
  * **Buttons:** "Leave Group" (if allowed), "Invite Member".
* **Project Proposal (`/student/proposal`):** 
  * **Text Fields:** Project Title, Abstract, Technologies.
  * **Buttons:** "Submit Proposal", "Edit Draft".
  * **Data Flow:** Submits proposal data to `/api/proposals` which changes the status to `PENDING` for faculty review.
* **Agile/Scrum Board (`/student/agile`):** 
  * **Data:** Kanban board with "To Do", "In Progress", "In Review", "Done" columns.
  * **Buttons:** "Add Task", "Start Sprint".
  * **Data Flow:** Dragging a task updates its `status` field via a PATCH request to `/api/agile/tasks/{id}`.
* **Reviews & Grades (`/student/reviews`):** 
  * **Data:** Displays marks obtained in various review cycles (e.g., Review 1, Review 2) and feedback from faculty.
* **GitHub Integration:**
  * **Buttons:** "Connect GitHub", "Sync Commits".
  * **Data Flow:** Links a repository to the project and pulls commit history to calculate individual student contributions.

### B. Faculty (Guide) Portal
**Navigation & Features:**
* **My Groups:** Lists all student groups assigned to the faculty member.
* **Proposal Review:** 
  * **Buttons:** "Approve", "Reject", "Request Changes".
  * **Text Fields:** Feedback comments.
  * **Data Flow:** Updates the proposal status and sends a Notification document to the students.
* **Guidance Logs:** Allows faculty to record meeting minutes, attendance, and action items for each group.
* **Evaluation:** Forms to grade students based on predefined criteria during official review weeks.

### C. Coordinator Portal
**Navigation & Features:**
* **SGP Cycles:** Create and manage academic semesters (e.g., "SGP-V 2026").
* **Group Allocations:** Automatically or manually assign faculty guides to student groups based on domain expertise.
* **Review Scheduling:** 
  * **Buttons:** "Schedule Review".
  * **Text Fields:** Date, Time, Venue, Panel Members.
* **Analytics & Reports:** View charts (powered by Recharts) showing the overall progress of all groups in the department.

### D. System Administrator
**Navigation & Features:**
* **User Management:** Import student and faculty lists via CSV to generate accounts.
* **System Config:** Manage global deadlines, department lists, and system-wide settings.

---

## 4. Core Database Collections (MongoDB)
Here is where all the data goes:

1. **`users`**: Stores authentication credentials, hashed passwords, and roles.
2. **`studentprofiles` & `facultyprofiles`**: Stores specific profile data (enrollment numbers, skills, designations).
3. **`projectgroups` & `groupmembers`**: Maps which students belong to which group and who their assigned guide is.
4. **`projects`**: The actual project details (title, description, status).
5. **`proposals`**: Submitted project ideas awaiting approval.
6. **`tasks`, `sprints`, `epics`**: Agile project management data for the Kanban boards.
7. **`reviews` & `studentmarks`**: Evaluation criteria, scheduled review panels, and final grades.
8. **`notifications`**: System alerts sent to users (e.g., "Your proposal was approved").
9. **`githubintegrations`**: Securely stores repo URLs and access tokens for pulling commit data.

---

## 5. UI/UX Elements
* **Notifications Bell:** Located in the top right navbar. Fetches unread `notifications` and displays a red badge.
* **Sidebar:** Context-aware navigation menu that changes based on the logged-in user's role.
* **Forms & Modals:** Uses Tailwind CSS for styling. Inputs are controlled React components that validate data locally before sending it to the FastAPI backend.
* **Tables:** Used extensively in the Coordinator and Faculty views for bulk data management, featuring sortable columns and pagination.
