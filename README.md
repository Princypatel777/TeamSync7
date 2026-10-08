# TeamSync — Academic Project Management & Evaluation Platform

TeamSync is a dedicated academic project management platform engineered specifically for college Software Group Projects (SGP). It streamlines the complete lifecycle from academic cycle setup and group formation to faculty mentoring, task management, shared documentation, GitHub contribution tracking, milestone reviews, and criteria-based grading.

Repository: [https://github.com/Princypatel777/TeamSync7](https://github.com/Princypatel777/TeamSync7)

---

## 🎯 The Problem
Colleges and universities often manage student group software projects using disconnected tools: spreadsheets for group rosters, external messaging apps for communication, separate drives for documents, and manual paperwork for milestone reviews and marking. This causes:
- Faculty mentors struggle to monitor whether students are actively and equitably contributing.
- Project coordinators lack visibility into guide allocations and department-wide milestone completion.
- Students have difficulty tracking upcoming deadlines, group tasks, and faculty feedback.
- Manual evaluation is prone to lost criteria scores and subjective assessment without code provenance.

## 💡 The Solution
**TeamSync** unifies the entire academic project workflow into one platform:
```
College / Academic Cycle
   → Student Groups (Join by Group Code)
      → Faculty Mentor (Assigned by Department Coordinator)
         → Group Project (Proposals, Revisions, Approvals)
            → Tasks / Kanban Board (To Do, In Progress, In Review, Done)
               → Shared Project Files (SRS, Diagrams, Reports)
                  → GitHub Integration (Commit tracking, PRs, Contributor stats)
                     → Academic Reviews (Review 1, 2, 3, Final Viva)
                        → Marks & Criteria-Based Feedback
```

---

## 👥 The Four Academic Roles

### 1. Student (`/student/dashboard`)
- **My Group:** View group members, role (Leader/Member), group code, and assigned faculty guide.
- **My Project:** Submit project proposals, respond to revision requests, and view approval status.
- **Kanban / Tasks:** Create tasks, assign teammates, set priority and due dates, move tasks across *To Do*, *In Progress*, *In Review*, and *Done*.
- **Shared Files:** Upload project SRS, design documents, and final reports with uploader-scoped deletion.
- **GitHub Sync:** View repository commits, branches, pull requests, and individual contributions.
- **Reviews & Marks:** Inspect review schedules, criteria-wise marks (Technical, Progress, Documentation, Presentation), and faculty mentor feedback.

### 2. Faculty / Mentor (`/faculty/dashboard`)
- **My Groups Dashboard:** Real-time visibility into all assigned student project groups:
  - Group name & code
  - Active project title
  - Student count
  - Overall project progress percentage
  - Pending & completed tasks count
  - Upcoming deadlines
  - Latest review & marks status
- **Group Details Workspace:** One-stop 8-section monitoring desk:
  1. *Overview:* Academic summary and high-level health metrics.
  2. *Students:* Member roster, enrollment numbers, contact details, and student profiles.
  3. *Project:* Proposal specifications, objectives, approval history, and revision workflows.
  4. *Tasks / Kanban:* Read/monitor student task progression across Kanban columns.
  5. *Files:* Download, view, and upload shared project deliverables.
  6. *GitHub:* Examine real repository commit activity and verify individual student contribution.
  7. *Reviews:* View department-scheduled review milestones and defense checkpoints.
  8. *Marks & Feedback:* Multi-criteria grading desk (Project Progress, Technical Contribution, Code Quality/Documentation, Presentation & Teamwork).

### 3. Department Coordinator (`/coordinator/dashboard`)
- **Groups & Students:** Department-wide roster of all registered groups and enrolled students.
- **Faculty Guide Allocation:** Assign and balance faculty supervisors across active project groups.
- **Proposal Approvals:** Departmental oversight over project proposals and AI similarity checks.
- **Review Scheduling:** Schedule Review 1, Review 2, and Final Viva milestones.
- **Department Analytics:** Track groups in progress, completed projects, and pending evaluations.

### 4. System Administrator (`/admin/dashboard`)
- **User Provisioning:** Create and manage Student, Faculty, and Coordinator accounts.
- **Academic Hierarchy:** Configure Departments, Academic Years, and SGP Cycles.
- **Platform Analytics:** Real-time KPIs covering total users, group counts, and completion rates.
- **Audit Logging:** Tamper-evident MongoDB audit trail tracking logins, approvals, and marks.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, TanStack React Query, React Flow |
| **Backend** | Node.js (v18+ / v20+ / v24+), Express.js (ES Modules), Mongoose |
| **Database** | MongoDB (v6.0+ / v7.0+) |
| **Authentication** | JWT (JSON Web Tokens), Bcryptjs password hashing, Role & Group middleware |
| **Integrations** | GitHub REST API, Similarity Analysis Engine |

> **Note on Architecture:** The canonical, production backend for TeamSync is the Node.js/Express server in `backend/`. All routes, authentication, models, and tests are verified against this service.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017` (or MongoDB Atlas URI)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Princypatel777/TeamSync7.git
cd TeamSync7
```

---

### Step 2: Configure & Start the Backend

```bash
cd backend
npm install
```

Create `backend/.env` (or use existing defaults):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/teamsync
JWT_SECRET=teamsync_super_secret_jwt_key_2026_academic_sgp_production
CORS_ORIGIN=http://localhost:5173
```

Seed initial institutional structure and demo accounts:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
# Server listens on http://localhost:5000
```

---

### Step 3: Configure & Start the Frontend

In a new terminal window:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Seeded Test Accounts

The following accounts are initialized when running `npm run seed`:

| Role | Login Identifier (College ID / Email) | Password | Default Redirect | Details |
|---|---|---|---|---|
| **Student 1** | `24IT001` | `student123` | `/student/dashboard` | Rahul Sharma (Team Alpha Lead) |
| **Student 2** | `24IT002` | `student123` | `/student/dashboard` | Priya Verma (Team Alpha Member) |
| **Student 3** | `24IT003` | `student123` | `/student/dashboard` | Aarav Patel (NextGen IoT Lead) |
| **Student 4** | `24IT004` | `student123` | `/student/dashboard` | Diya Shah (NextGen IoT Member) |
| **Student 5** | `24IT005` | `student123` | `/student/dashboard` | Rohan Mehta (NextGen IoT Member) |
| **Student 6** | `24IT006` | `student123` | `/student/dashboard` | Ananya Joshi (Available Student) |
| **Student 7** | `24IT007` | `student123` | `/student/dashboard` | Harsh Desai (Available Student) |
| **Faculty Guide** | `faculty@teamsync.edu` | `faculty123` | `/faculty/dashboard` | Dr. Ananya Sharma |
| **Coordinator** | `coordinator@teamsync.edu` | `coord123` | `/coordinator/dashboard` | Prof. Hitesh Patel |
| **System Admin** | `admin@teamsync.edu` | `admin123` | `/admin/dashboard` | System Administrator |

---

## 🧪 Verification & Automated Testing

TeamSync includes comprehensive end-to-end verification suites verifying all 24 functional and security requirements:

```bash
cd backend

# Run the 24-step end-to-end verification journey:
node scripts/verify_all_steps.js

# Run the Department Coordinator API verification:
node scripts/verify_coordinator.js
```

All 24 steps verify:
- Admin academic hierarchy setup
- Student registration & Bcrypt password hashing
- Group formation & Code-based membership
- Project proposal submission, faculty revision requests, and resubmissions
- Faculty assignment isolation (unassigned faculty cannot view proposals)
- Shared project file upload and download authorization (403 for unauthorized students)
- GitHub integration without credential leaks
- Criteria-based grading math & grade calculations
- Role analytics, audit logging, and rogue access denial

---

## 📄 License
This project is developed for Academic Software Group Project management under the MIT License.