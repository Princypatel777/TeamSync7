# TeamSync — Master Integration, Data Connectivity, End-to-End Completion & Production Readiness

## ROLE

Act as a Senior Full-Stack Architect, FastAPI Engineer, React Engineer, MongoDB/Beanie Engineer, Security Engineer, QA Engineer, and Technical Lead.

You are working on an EXISTING project:

**TeamSync — SGP Project Management Platform**

The project is already approximately 85% implemented.

Your task is NOT to rebuild the application.

Your task is to:

> AUDIT → TRACE → CONNECT → FIX → INTEGRATE → TEST → POLISH

the entire existing system so that every implemented feature shares the correct real data and all role-based workflows work end-to-end.

---

# 1. NON-NEGOTIABLE RULES

Before changing ANYTHING:

1. Inspect the complete repository.
2. Inspect frontend architecture.
3. Inspect backend architecture.
4. Inspect all FastAPI routers.
5. Inspect all MongoDB/Beanie models.
6. Inspect authentication and JWT implementation.
7. Inspect role/permission handling.
8. Inspect API services/hooks.
9. Inspect React Query/Axios usage.
10. Inspect existing database relationships.
11. Inspect notifications.
12. Inspect audit logs.
13. Inspect all existing dashboards.
14. Inspect all existing routes/pages/components.
15. Inspect environment variables.
16. Inspect existing seed/demo data.
17. Inspect existing tests.
18. Inspect existing error handling.
19. Inspect existing workflow documentation.

DO NOT start by blindly writing new code.

First create an internal dependency map of the application.

---

# 2. EXISTING TECHNOLOGY STACK

Preserve the existing stack unless a change is absolutely necessary.

Expected architecture:

Frontend:

* React
* Vite
* Tailwind CSS
* React Query / Axios
* Recharts

Backend:

* Python
* FastAPI
* Pydantic
* Beanie ODM

Database:

* MongoDB

Authentication:

* JWT

Data flow:

React UI
↓
React Query / Axios
↓
FastAPI
↓
Authentication / Authorization
↓
API Router
↓
Business Logic
↓
Beanie ODM
↓
MongoDB
↓
Response
↓
React Query
↓
React UI

Do NOT replace the architecture.

---

# 3. PRIMARY OBJECTIVE

The application currently has many individually implemented features.

The problem is that they are not completely connected.

Examples:

* Student creates group but Group Code/join flow may fail.
* Invitations may not update group membership.
* Coordinator may not see newly created groups.
* Faculty allocation may not propagate to student.
* Proposal status changes may not update every relevant dashboard.
* Notifications may not be generated consistently.
* Review scheduling may not connect to groups/faculty/students.
* Analytics may use incomplete or disconnected data.
* GitHub data may not reach contribution dashboards.
* Files may save metadata without actual storage.
* Chat messages exist but real-time synchronization is incomplete.
* AI buttons may return mock/basic responses.
* Admin-imported users may not propagate correctly to profiles/roles.

Your task is to make the platform behave like ONE CONNECTED SYSTEM.

---

# 4. SOURCE OF TRUTH

Use the following priority when resolving conflicts:

1. Existing database/business logic
2. Existing SRS/requirements
3. Existing implemented API behavior
4. Existing PRD
5. Existing UI/UX
6. Existing workflow documentation
7. Existing frontend assumptions

Do NOT silently invent new business rules.

If two parts of the application conflict:

* identify the conflict
* determine the safest existing behavior
* document the decision
* implement consistently

Do not redesign the product.

---

# 5. CORE ROLES

The platform has four roles:

## STUDENT

Student can:

* login
* view dashboard
* manage group
* create/join group
* receive invitations
* accept/reject invitations
* view faculty guide
* create proposal
* save proposal draft
* submit proposal
* receive proposal feedback
* manage project requirements
* use Agile/Kanban
* work with sprints/tasks
* use group chat
* upload project files
* connect GitHub
* view reviews
* view marks/feedback
* receive notifications

## FACULTY

Faculty can:

* login
* view assigned groups
* view group members
* view assigned projects
* review proposals
* approve/reject/request changes
* add guidance logs
* evaluate groups
* participate in reviews
* provide marks/feedback
* receive notifications

## COORDINATOR

Coordinator can:

* manage SGP cycles
* view all groups
* allocate faculty guides
* manually assign/reassign faculty
* automatically allocate where supported
* schedule reviews
* manage review panels
* view department analytics
* view group/project progress
* monitor proposals/projects/reviews

## SYSTEM ADMINISTRATOR

Admin can:

* manage users
* import students/faculty via CSV
* create/update accounts
* manage departments
* manage system configuration
* manage global deadlines
* manage SGP cycle configuration
* manage system-wide settings

---

# 6. DATABASE INTEGRATION

Existing logical MongoDB collections include:

users
studentprofiles
facultyprofiles
projectgroups
groupmembers
projects
proposals
tasks
sprints
epics
reviews
studentmarks
notifications
githubintegrations

Also inspect existing collections such as:

auditlogs
projectfiles
requirements
chat/messages
guidancelogs
sgpcycles
systemconfig
and any other collection already implemented.

IMPORTANT:

Do NOT create duplicate collections if equivalent collections already exist.

First inspect the actual models.

Create a dependency map:

users
↓
studentprofiles / facultyprofiles
↓
projectgroups
↓
groupmembers
↓
projects
↓
proposals
↓
sprints / epics / tasks
↓
reviews
↓
studentmarks

Supporting systems:

notifications
auditlogs
projectfiles
githubintegrations
chat
sgpcycles
systemconfig

---

# 7. DATA OWNERSHIP RULE

Every important piece of information must have ONE authoritative source.

Examples:

Student identity:
users + studentprofiles

Faculty identity:
users + facultyprofiles

Group:
projectgroups

Group membership:
groupmembers

Project:
projects

Proposal:
proposals

Task:
tasks

Sprint:
sprints

Review:
reviews

Marks:
studentmarks

Notification:
notifications

Audit:
auditlogs

GitHub integration:
githubintegrations

Do not maintain contradictory copies of the same state in unrelated documents unless the existing architecture intentionally uses denormalized data.

---

# 8. COMPLETE STUDENT GROUP SYSTEM

This is a PRIORITY FIX.

## CREATE GROUP

Student:

Create New Group
↓
Enter Project Group Name
↓
Create Group

System must:

1. Verify authenticated student.
2. Verify student is not already assigned to another group.
3. Identify active SGP cycle.
4. Create projectgroup.
5. Generate unique Group Code.
6. Store Group Code in MongoDB.
7. Create groupmembers record.
8. Make creator LEADER.
9. Connect group to active SGP cycle.
10. Return complete group information.

Example:

Group Name:
TeamSync Avengers

Group Code:
SGP-X7K92

Leader:
Priya Verma

The Group Code must be:

* unique
* database-persisted
* easy to copy
* not MongoDB _id
* generated safely
* searchable/indexed

---

# 9. JOIN GROUP BY CODE

Student page MUST contain:

Group Code *

[____________]

[Join Group]

Flow:

Student
↓
Enter Group Code
↓
Frontend validation
↓
POST API
↓
Backend authentication
↓
Find group by groupCode
↓
Verify active group/cycle
↓
Verify student is not already in another group
↓
Verify capacity/business rules
↓
Create groupmembers record
↓
Return updated group
↓
Refresh React Query
↓
Student sees group

Handle:

* empty code
* invalid code
* group not found
* already in a group
* already member
* group full
* inactive cycle
* database error
* authorization error

Do NOT fake the join using local React state.

---

# 10. GROUP INVITATIONS

Complete invitation lifecycle:

Leader
↓
Invite Student
↓
Create invitation
↓
Create notification
↓
Student receives notification
↓
Student sees invitation
↓
Accept / Reject

Invitation statuses:

PENDING
ACCEPTED
REJECTED

Accept:

1. Verify authenticated student.
2. Verify invitation belongs to student.
3. Verify invitation is PENDING.
4. Verify group exists.
5. Verify student is not already in another group.
6. Create membership.
7. Mark invitation ACCEPTED.
8. Create notification where appropriate.
9. Update pending count.
10. Refresh group state.

Reject:

1. Verify ownership.
2. Verify PENDING.
3. Mark REJECTED.
4. Update notification/invitation state.
5. Refresh UI.

Prevent duplicate pending invitations.

---

# 11. SGP CYCLES

Coordinator/Admin must be able to manage:

Example:

SGP-V 2026

Fields may include:

* name
* academic year
* start date
* end date
* status
* deadlines

Every newly created project group should correctly belong to the active SGP cycle.

Do NOT allow data from one cycle to accidentally appear in another cycle.

All dashboards, groups, proposals, reviews and analytics should respect the relevant SGP cycle.

---

# 12. FACULTY GUIDE ALLOCATION

Coordinator:

View Groups
↓
Select Group
↓
Assign Faculty Guide

System must:

1. Validate coordinator authorization.
2. Validate faculty exists.
3. Validate group exists.
4. Save guide assignment.
5. Make assignment visible to:

   * student
   * group
   * faculty
   * coordinator
6. Generate notifications where appropriate.
7. Update dashboards.
8. Create audit log.

If automatic allocation already exists:

* inspect its current implementation
* preserve it
* ensure it actually writes the assignment to the authoritative database
* do not replace it unnecessarily

Allocation should consider faculty expertise/domain only where that functionality already exists or is explicitly required.

---

# 13. PROPOSAL WORKFLOW

Existing workflow:

Student
↓
Save Draft
↓
Submit Proposal
↓
Status = PENDING
↓
Assigned Faculty Notification
↓
Faculty Review

Faculty can:

APPROVE
REJECT
REQUEST CHANGES

Status transitions must be consistent.

Example:

DRAFT
→ PENDING
→ APPROVED

or

PENDING
→ REVISION_REQUESTED
→ PENDING

or

PENDING
→ REJECTED

Every transition must:

* persist in MongoDB
* update frontend
* update relevant dashboards
* create notification
* create audit log where required

Do not allow invalid status transitions.

---

# 14. PROJECT + AGILE DATA CONNECTION

The following must be connected:

Project
↓
Epics
↓
Sprints
↓
Tasks

Student Kanban must use the actual project/group data.

When task status changes:

To Do
→ In Progress
→ Done

the change must persist in MongoDB.

Refresh must preserve the state.

Coordinator/Faculty progress dashboards must derive progress from actual stored project/task data.

Do NOT calculate fake percentages.

---

# 15. REQUIREMENTS SYSTEM

Functional requirements and non-functional requirements must belong to the correct project.

Creating a requirement:

Student
↓
Project
↓
Requirement

Coordinator/Faculty should see the appropriate requirements according to role.

Changes must persist and appear after refresh.

---

# 16. REVIEW SCHEDULING

Coordinator must have:

[Schedule Review]

Fields:

* Review Name/Type
* Date
* Time
* Venue
* Panel Members
* SGP Cycle
* Groups

Flow:

Coordinator
↓
Create Review
↓
Validate
↓
Save review
↓
Connect review to groups
↓
Connect panel members
↓
Generate notifications
↓
Students/Faculty see review

Prevent:

* invalid dates
* missing panel
* invalid faculty
* invalid group
* duplicate/conflicting review where business rules prohibit it

---

# 17. MARKS + EVALUATION

Review
↓
Evaluation
↓
Student/Group Marks
↓
Feedback
↓
Student dashboard

Marks must be connected to:

* review
* group
* student
* evaluator
* cycle

Faculty/coordinator must see correct data.

Students must only see marks they are authorized to see.

Sensitive evaluation data must be protected by backend authorization.

---

# 18. NOTIFICATION SYSTEM

The Notifications Bell is a GLOBAL integration point.

Every important event should generate the appropriate notification.

Examples:

Group invitation
Faculty assigned
Proposal submitted
Proposal approved
Proposal rejected
Revision requested
Review scheduled
Review updated
Marks published
Deadline approaching
Project status changed
GitHub sync issue
File upload status
etc.

Notification document should contain appropriate fields such as:

* recipient
* type
* title
* message
* related entity
* related entity ID
* read/unread
* createdAt

The red badge must represent actual unread notifications.

Clicking notification should navigate to the correct related page where possible.

Do NOT use hardcoded notification counts.

---

# 19. AUDIT LOGGING

Sensitive actions must generate audit records.

Examples:

* login/security events where implemented
* group creation
* guide assignment
* proposal approval
* proposal rejection
* marks/evaluation
* admin import
* configuration changes

Audit logs must contain enough information to determine:

WHO
WHAT
WHEN
WHICH ENTITY

Do not expose audit logs to unauthorized students.

---

# 20. CHAT SYSTEM

Current REST chat exists.

Verify:

* messages save correctly
* correct group is used
* correct sender is recorded
* only authorized group members can access the chat
* messages persist after refresh

If WebSockets are already partially implemented:

FIX them.

If not implemented:

Do not destabilize the existing REST system just to add WebSockets.

Real-time chat can be treated as a controlled enhancement after core data integration.

---

# 21. GITHUB INTEGRATION

Existing GitHubIntegration model exists.

Verify:

1. Repository URL belongs to correct project/group.
2. GitHub integration belongs to correct project.
3. Access credentials/tokens are not exposed to frontend.
4. GitHub data is associated with correct students/group.
5. Contribution statistics shown in dashboards come from actual GitHub data.

If automatic sync is incomplete:

Implement a safe backend synchronization mechanism only if the existing architecture supports it.

Do NOT expose GitHub tokens in React responses.

Do NOT put secrets in MongoDB documents in plaintext if the existing architecture supports secure handling.

---

# 22. FILE UPLOAD SYSTEM

Current UI picker and ProjectFile model exist.

Complete the actual file storage flow.

Required:

Frontend
↓
Upload
↓
FastAPI
↓
Validation
↓
Storage
↓
Metadata saved in MongoDB
↓
Project/group association
↓
Download/view

Validate:

* file size
* file type
* ownership
* permissions
* upload errors

Do not claim upload success if only metadata was saved.

If cloud storage is not configured, implement the safest existing local/storage abstraction without breaking deployment.

---

# 23. AI FEATURES

Current buttons:

"Get AI Recommendations"
"Scan Similarity"

Currently may return mock/basic responses.

Do NOT silently pretend AI is production-ready.

First inspect existing endpoints.

If an AI provider is configured:

connect it properly.

If no provider is configured:

* keep the feature clearly marked as unavailable/configuration-required
* do not return fake AI output
* provide meaningful error handling

Never expose API keys in frontend code.

---

# 24. ADMIN CSV IMPORT

Admin:

Upload CSV
↓
Parse
↓
Validate
↓
Preview
↓
Confirm
↓
Create/update users
↓
Create student/faculty profiles
↓
Return import summary

Handle:

* duplicate email
* duplicate enrollment number
* invalid role
* missing fields
* invalid department
* malformed CSV
* existing account
* password generation
* hashing

Never store plaintext passwords.

---

# 25. ROLE-BASED SECURITY

Frontend role checks are NOT sufficient.

Backend must verify:

JWT
↓
Authenticated User
↓
Role
↓
Resource ownership/access
↓
Operation

Examples:

Student A must not access Student B's private data.

Student cannot approve proposals.

Student cannot assign faculty.

Faculty cannot modify unrelated groups.

Coordinator cannot perform system-admin-only operations unless explicitly permitted.

Admin can manage system configuration.

Every sensitive endpoint must have authorization checks.

---

# 26. FRONTEND / BACKEND CONTRACT

Audit every API.

For every endpoint document internally:

METHOD
ROUTE
ROLE
REQUEST
RESPONSE
DATABASE COLLECTIONS
SIDE EFFECTS
NOTIFICATIONS
AUDIT LOG

Check camelCase/snake_case conversion carefully.

Current middleware:

Frontend camelCase
↓
Backend snake_case
↓
MongoDB
↓
Backend snake_case
↓
Frontend camelCase

Verify this works consistently for:

* nested objects
* arrays
* IDs
* dates
* pagination
* query parameters
* errors

Do not break existing working endpoints.

---

# 27. REACT QUERY / CACHE CONSISTENCY

A major requirement:

After a mutation, related queries must be invalidated/refetched.

Examples:

Create Group
→ invalidate current user group
→ invalidate coordinator groups

Join Group
→ invalidate group membership
→ invalidate student dashboard

Assign Faculty
→ invalidate group
→ invalidate faculty groups
→ invalidate student group
→ invalidate coordinator groups

Approve Proposal
→ invalidate proposal
→ invalidate student dashboard
→ invalidate faculty proposals
→ notification query

Schedule Review
→ invalidate reviews
→ invalidate student reviews
→ invalidate faculty reviews
→ coordinator analytics

Do not require users to manually refresh the browser to see correct data.

---

# 28. DASHBOARD DATA

Every dashboard must use live backend data.

Student dashboard:

* group
* guide
* proposal status
* tasks
* deadlines
* reviews
* notifications
* project progress

Faculty dashboard:

* assigned groups
* pending proposals
* upcoming reviews
* guidance logs
* project progress

Coordinator dashboard:

* total groups
* groups without guides
* proposals
* project status
* reviews
* progress
* department analytics

Admin:

* users
* departments
* system configuration
* SGP cycles
* import statistics

No fake counters.

No hardcoded charts.

No hardcoded status.

---

# 29. ANALYTICS

Recharts must use actual API/database data.

Possible metrics:

* Total groups
* Active projects
* Proposal status distribution
* Approved/rejected/revision requested
* Guide allocation
* Task completion
* Sprint progress
* Review completion
* Marks distribution
* Department/project progress

Verify that filters respect:

* active SGP cycle
* department
* role
* project/group scope

---

# 30. SIDEBAR + NAVIGATION

Sidebar must dynamically reflect role.

Student:

* Dashboard
* Project Group
* Proposal
* Agile
* Requirements
* Files
* Chat
* Reviews
* GitHub
* Notifications

Faculty:

* Dashboard
* Groups
* Proposals
* Guidance
* Reviews
* etc.

Coordinator:

* Dashboard
* SGP Cycles
* Groups/Allocations
* Reviews
* Analytics
* Reports

Admin:

* Dashboard
* Users
* CSV Import
* Departments
* System Config
* SGP Configuration

Do not show unauthorized pages.

But remember:

Hiding a page is NOT security.

Backend authorization remains mandatory.

---

# 31. TABLES

Coordinator and Faculty tables must support the existing requirements:

* real backend data
* pagination
* sorting
* loading state
* empty state
* error state
* refresh
* correct role-based access

Pagination must not accidentally show duplicate/missing records.

---

# 32. ERROR HANDLING

Never expose raw Python/MongoDB exceptions to users.

Convert technical errors into meaningful UI messages.

Example:

Instead of:

"DuplicateKeyError: E11000..."

show:

"This Group Code is already in use. Please try again."

Log technical details safely on backend.

---

# 33. LOADING / EMPTY / ERROR STATES

Every major API-driven page must have:

Loading
↓
Success
↓
Empty
↓
Error

Do not leave blank screens.

Examples:

No group:

"You are currently not assigned to a project group."

No invitations:

"You have no pending group invitations."

No proposals:

"No proposals found."

No reviews:

"No reviews scheduled."

---

# 34. DATA CONSISTENCY RULE

Whenever one action changes an entity, identify ALL affected entities.

Example:

Faculty assignment changes:

projectgroups
groupmembers/guide relationship
student dashboard
faculty dashboard
coordinator dashboard
notifications
auditlogs

Proposal approval:

proposals
notifications
student dashboard
faculty dashboard
project status if applicable
auditlogs

Group invitation acceptance:

groupinvitations
groupmembers
projectgroups
student dashboard
notifications

Make these dependencies explicit and ensure the UI refreshes correctly.

---

# 35. END-TO-END STUDENT WORKFLOW

Implement and test:

Student Login
↓
Dashboard
↓
Create/Join Group
↓
Group Code
↓
Group Membership
↓
Faculty Allocation
↓
View Guide
↓
Create Proposal
↓
Save Draft
↓
Submit
↓
Faculty Notification
↓
Faculty Review
↓
Approve / Reject / Request Changes
↓
Project Active
↓
Requirements
↓
Sprint
↓
Tasks
↓
Development
↓
GitHub
↓
Review Scheduling
↓
Faculty Evaluation
↓
Marks
↓
Final Project Completion

Every step must use real persisted data.

---

# 36. END-TO-END COORDINATOR WORKFLOW

Coordinator Login
↓
Create/Select SGP Cycle
↓
View Groups
↓
See newly created groups
↓
Assign Faculty
↓
Student sees Faculty
↓
Faculty sees Group
↓
Schedule Review
↓
Students/Faculty receive Notification
↓
Faculty evaluates
↓
Marks saved
↓
Analytics updated

---

# 37. END-TO-END ADMIN WORKFLOW

Admin Login
↓
Import CSV
↓
Validate
↓
Preview
↓
Confirm
↓
Users Created
↓
Profiles Created
↓
Students/Faculty Can Login
↓
Roles Correct
↓
Department Correct
↓
SGP Cycle Configuration
↓
System Works With Imported Users

---

# 38. WORKFLOW ARCHITECTURE

Preserve this architecture:

```mermaid
flowchart TD

Frontend[React + Vite]
        |
        v
ReactQuery[React Query / Axios]
        |
        v
FastAPI[FastAPI Backend]
        |
        v
Middleware[CamelCase / Validation Middleware]
        |
        v
Auth[JWT Authentication + RBAC]
        |
        v
Router[API Routers]
        |
        v
Service[Business Logic]
        |
        v
Beanie[Beanie ODM]
        |
        v
MongoDB[(MongoDB)]

MongoDB --> Notifications[Notifications]
MongoDB --> Audit[Audit Logs]

Notifications --> Student
Notifications --> Faculty
Notifications --> Coordinator
Notifications --> Admin
```

---

# 39. DO NOT BREAK WORKING FEATURES

Existing completed functionality must remain working:

Authentication
Student dashboard
Faculty dashboard
Proposal workflow
Kanban
Requirements
Guidance logs
Notifications
Audit logging
Role-based sidebar
Existing routes
Existing UI

Before changing a shared model/API:

search all usages.

Before changing a database field:

search all frontend/backend references.

Before deleting anything:

prove it is unused.

---

# 40. TESTING STRATEGY

After integration, perform full testing.

## Authentication

* Student login
* Faculty login
* Coordinator login
* Admin login
* invalid credentials
* expired JWT
* unauthorized endpoint

## Group

* create
* join
* invalid code
* duplicate membership
* invitation
* accept
* reject
* refresh persistence

## Coordinator

* SGP cycle
* group visibility
* guide allocation
* review scheduling
* analytics

## Faculty

* assigned groups
* proposals
* guidance logs
* reviews
* marks

## Student

* proposal
* requirements
* tasks
* sprint
* files
* chat
* GitHub
* reviews
* notifications

## Admin

* CSV import
* duplicate handling
* profile creation
* system configuration

---

# 41. CRITICAL TEST

Use multiple test accounts.

Example:

Student A
Student B
Student C

Faculty A
Faculty B

Coordinator A
Admin A

Perform:

A creates Group X
↓
B joins Group X using code
↓
A invites C
↓
C accepts
↓
Coordinator sees Group X
↓
Coordinator assigns Faculty A
↓
Faculty A sees Group X
↓
A submits proposal
↓
Faculty A receives notification
↓
Faculty A approves
↓
Coordinator sees updated status
↓
Student sees APPROVED
↓
Coordinator schedules Review
↓
Student + Faculty see Review
↓
Faculty submits marks
↓
Student sees marks
↓
Coordinator analytics update

If ANY link fails, trace the complete chain and fix it.

---

# 42. ROOT-CAUSE DEBUGGING

For every broken feature trace:

UI
→ handler
→ API request
→ FastAPI route
→ dependency/auth
→ service/business logic
→ Beanie model
→ MongoDB
→ response serialization
→ frontend state
→ React Query cache
→ UI

Do not patch only the final UI symptom.

Find the broken layer.

---

# 43. NO MOCK DATA

Remove/replace mock data ONLY where it is pretending to be production functionality.

Do not create fake:

* users
* groups
* invitations
* notifications
* proposals
* marks
* analytics
* GitHub commits
* reviews

If a third-party integration genuinely requires configuration:

show a proper configuration-required state instead of fake success.

---

# 44. SECURITY AUDIT

Check:

* JWT handling
* password hashing
* authorization
* MongoDB injection risks
* file upload validation
* GitHub token protection
* API secrets
* CORS
* sensitive response fields
* role escalation
* IDOR/resource access
* admin endpoints
* student-to-student data leakage

Never return password hashes to frontend.

Never return GitHub access tokens to frontend.

Never expose internal secrets.

---

# 45. PERFORMANCE

Check:

* unnecessary API calls
* duplicate queries
* React Query caching
* pagination
* MongoDB indexes
* expensive dashboard aggregation
* unnecessary frontend re-renders
* large API responses

Do not prematurely rewrite working code.

---

# 46. DOCUMENTATION

After completing integration, update/create:

`TEAMSYNC-INTEGRATION-REPORT.md`

Include:

1. Current architecture
2. Data flow
3. Role permissions
4. Database relationships
5. API relationships
6. Group workflow
7. Proposal workflow
8. Review workflow
9. Notification workflow
10. Admin workflow
11. GitHub workflow
12. File workflow
13. Chat workflow
14. Known limitations
15. Third-party configuration required
16. Tests performed
17. Bugs fixed
18. Remaining issues

---

# 47. REQUIRED FINAL REPORT

At the end provide:

## A. SYSTEM AUDIT

* frontend status
* backend status
* database status
* authentication status
* role status

## B. FEATURE STATUS

Create a table:

| Feature            | Frontend | Backend | Database | Integration | Tested |
| ------------------ | -------- | ------- | -------- | ----------- | ------ |
| Authentication     |          |         |          |             |        |
| Student Group      |          |         |          |             |        |
| Group Code         |          |         |          |             |        |
| Invitations        |          |         |          |             |        |
| SGP Cycles         |          |         |          |             |        |
| Faculty Allocation |          |         |          |             |        |
| Proposal           |          |         |          |             |        |
| Agile              |          |         |          |             |        |
| Requirements       |          |         |          |             |        |
| Reviews            |          |         |          |             |        |
| Marks              |          |         |          |             |        |
| Notifications      |          |         |          |             |        |
| Audit Logs         |          |         |          |             |        |
| Chat               |          |         |          |             |        |
| Files              |          |         |          |             |        |
| GitHub             |          |         |          |             |        |
| AI                 |          |         |          |             |        |
| Analytics          |          |         |          |             |        |
| CSV Import         |          |         |          |             |        |
| System Config      |          |         |          |             |        |

Use:

PASS
PARTIAL
FAIL
NOT CONFIGURED

Do not claim PASS without actually testing it.

---

# 48. BUG CLASSIFICATION

For every remaining issue:

CRITICAL
HIGH
MEDIUM
LOW

Record:

* ID
* feature
* root cause
* affected roles
* affected collections
* affected API
* fix
* verification
* status

---

# 49. FINAL ACCEPTANCE CRITERIA

The project is considered integrated only when:

[ ] Authentication works for all roles
[ ] JWT authorization works
[ ] Student group creation works
[ ] Group Code generated and persisted
[ ] Group Code visible
[ ] Join by Group Code works
[ ] Group membership persists
[ ] Invitations work
[ ] Accept invitation works
[ ] Reject invitation works
[ ] Notification count updates
[ ] SGP Cycles work
[ ] Groups belong to correct cycle
[ ] Coordinator sees groups
[ ] Faculty allocation works
[ ] Student sees assigned guide
[ ] Faculty sees assigned groups
[ ] Proposal draft works
[ ] Proposal submission works
[ ] Faculty approval works
[ ] Faculty rejection works
[ ] Request Changes works
[ ] Notifications generated
[ ] Audit logs generated
[ ] Project data connected
[ ] Requirements connected
[ ] Sprints connected
[ ] Tasks connected
[ ] Kanban persistence works
[ ] Reviews connected to groups
[ ] Review scheduling works
[ ] Marks connected to students/reviews
[ ] Student sees authorized marks
[ ] Analytics use real data
[ ] Chat persists correctly
[ ] File uploads actually store files
[ ] GitHub integration is secure
[ ] Admin CSV import works
[ ] Profiles created correctly
[ ] System configuration persists
[ ] Role-based navigation works
[ ] Backend authorization works
[ ] No critical data leakage
[ ] No fake production data
[ ] No critical console errors
[ ] No critical backend errors
[ ] Refresh does not lose state
[ ] Logout/login preserves correct data
[ ] End-to-end workflow passes

---

# 50. MOST IMPORTANT INSTRUCTION

DO NOT simply make every page individually appear functional.

The goal is NOT:

"Every button works."

The goal is:

> "Every button changes the correct real data, and every other part of the system that depends on that data sees the change."

Example:

If Coordinator assigns Faculty A to Group X:

MongoDB
↓
projectgroups
↓
Student Group Page
↓
Student Dashboard
↓
Faculty Dashboard
↓
Coordinator Group Table
↓
Notifications
↓
Audit Log

must all remain consistent.

Likewise:

Proposal Approved

must propagate to:

Proposal
↓
Project status if applicable
↓
Student dashboard
↓
Faculty dashboard
↓
Coordinator analytics
↓
Notification
↓
Audit log

---

# 51. EXECUTION ORDER

Follow this exact order:

PHASE 1 — Repository & architecture audit

PHASE 2 — Database/model audit

PHASE 3 — Authentication/RBAC audit

PHASE 4 — API/frontend contract audit

PHASE 5 — Student group + invitation integration

PHASE 6 — SGP cycle + coordinator integration

PHASE 7 — Faculty allocation integration

PHASE 8 — Proposal/project/Agile integration

PHASE 9 — Review + marks integration

PHASE 10 — Notification + audit integration

PHASE 11 — Chat/files/GitHub integration

PHASE 12 — Admin CSV/configuration integration

PHASE 13 — Dashboard + analytics integration

PHASE 14 — Security audit

PHASE 15 — Performance audit

PHASE 16 — Full end-to-end testing

PHASE 17 — Regression testing

PHASE 18 — Documentation

Do not jump directly to Phase 18.

---

# 52. FINAL RULE

DO NOT:

* redesign the UI
* replace React
* replace FastAPI
* replace MongoDB
* replace Beanie
* remove existing working features
* create duplicate database models
* create duplicate APIs
* create fake data
* hardcode counts
* hardcode group codes
* bypass authorization
* expose secrets
* silently change requirements
* add unnecessary features

DO:

* inspect
* trace
* connect
* reuse
* fix
* test
* document

The final objective is a SINGLE CONNECTED TEAMSYNC PLATFORM where:

STUDENT
↕
GROUP
↕
PROJECT
↕
FACULTY
↕
COORDINATOR
↕
SGP CYCLE
↕
REVIEWS
↕
MARKS
↕
NOTIFICATIONS
↕
ANALYTICS
↕
ADMIN

all operate on consistent real database data.

Do not stop at 85%.

Bring the existing implementation to a genuinely integrated, tested, production-ready state without rebuilding the application.
