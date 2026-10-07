# TeamSync — SGP Project Management Platform

TeamSync is a full-stack project management platform engineered specifically for academic institutions to streamline Software Group Projects (SGP). It offers role-based portals for Students, Faculty Guides, Project Coordinators, and System Administrators.

---

## 🚀 Features

- **Multi-Role Portals:** Tailored workflows and dashboards for Students, Faculty, Coordinators, and Admins.
- **Project Proposals:** Submission, revision tracking, and faculty approval workflows.
- **Agile / Kanban Boards:** Sprint planning, backlog management, and task boards.
- **GitHub Integration:** Link repositories and analyze individual and group commit activity.
- **Evaluation & Grading:** Structured review cycles, rubric-based grading, and feedback logs.
- **Analytics & Reporting:** Progress tracking, milestone completion, and coordinator analytics.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend:** 
  - Python / FastAPI, Beanie ODM (MongoDB Async)
  - Node.js / Express backend option
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt hashing

---

## 📂 Repository Structure

```text
├── frontend/          # React + Vite client application
├── backend/           # Node.js / Express server
├── backend-python/    # Python FastAPI server
└── docs/              # Specifications, PRD, and design docs
```

---

## 💻 Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup

#### Python (FastAPI):
```bash
cd backend-python
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

#### Node.js (Express):
```bash
cd backend
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License.