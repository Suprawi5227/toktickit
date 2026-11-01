# TokTickIT - IT Service Desk & Management System

TokTickIT is an Enterprise IT Support Ticketing, Work Log Attribution, and Role-Based Operations Management system built for **CPE334 (Introduction to Software Engineering in the Age of AI Agents)**.

```text
React UI (Zen Green Theme) -> Express REST API -> Prisma ORM -> PostgreSQL
```

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite, Bootstrap 5, Zen Green Design System (`#006B3C`)
* **Backend:** Node.js, Express, TypeScript, JWT & Cookie Session Authentication, bcrypt, Zod
* **Database:** PostgreSQL 16 (Docker), Prisma ORM
* **Testing:** Vitest, React Testing Library, Supertest, Playwright (E2E)

---

## 📂 Repository Structure

```text
toktickit/
  client/
    src/
      components/
        ActionsTaken.tsx         # Lab 4: Chronological work logs & modal validation
        StaffDashboard.tsx       # Lab 4: IT Staff & Admin metrics + Queue drill-down
        RequesterDashboard.tsx   # Lab 4: Isolated Requester metrics & recent tickets
        StaffTicketDetail.tsx    # Lab 3 & 4: State machine transitions, Advisory banner, 409 alert
        TicketDetail.tsx         # Lab 2 & 4: Requester ticket view, Advisory resolution button
        StaffTicketQueue.tsx     # Lab 3 & 4: Search, filters, sort, pagination & drill-down receiver
        LoginScreen.tsx          # Lab 3: Authentication & mandatory password change
        UserManagement.tsx       # Lab 3: Admin user CRUD & safety enforcement
      contexts/
        AuthContext.tsx
    tests/
      lab-01/ .. lab-04/         # 8 test suites (25 component & integration tests)
  server/
    prisma/
      schema.prisma              # Models: User, Ticket, ActionTaken, PublicComment, InternalNote, etc.
      migrations/                # Prisma SQL migrations including 20261101025500_add_actions_taken
      seed.ts                    # Idempotent seed across all roles, ticket states & work logs
    src/
      middleware/
        auth.ts                  # JWT / Cookie authentication & RBAC middleware
      routes/
        auth.routes.ts           # Login, logout, session, mandatory password change
        actions-taken.routes.ts  # Lab 4: Actions Taken CRUD, BR-04 validation, BR-10 concurrency
        staff.routes.ts          # Lab 3 & 4: Queue, Claim, Reassign, BR-07 State Machine, BR-08 Gate
        dashboard.routes.ts      # Lab 4: Authoritative Staff/Admin & Requester dashboard aggregations
        admin.routes.ts          # Lab 3: User management & safety rules
    tests/
      lab-01/ .. lab-04/         # 18 test suites (48 unit, API & regression tests)
  e2e/
    lab-04/                      # 3 Playwright E2E spec files (6 end-to-end user flows)
  docs/
    lab-01/ .. lab-03/
    lab-04/
      specification.md           # Sprint 4 Engineering Specification (FR-01..12, BR-01..16, AC-01..14)
      ui-spec.md                 # UI & Zen Green Design Contract
      api-spec.md                # RESTful API Contract
      tests.md                   # Test Plan & AC Traceability Matrix (47 test cases)
      reviewer.md                # Peer Review Audit Log & Sign-Off (@natthakamol1130)
      ai-use.md                  # Key LLM Prompts & Engineering Reflection
  playwright.config.ts
  README.md
```

---

## 🚀 Local Setup & Installation

### 1) Start PostgreSQL Database
```bash
docker compose up -d
```

### 2) Install Dependencies
```bash
# Root (Playwright E2E runner)
npm install

# Backend Server
cd server
npm install

# Frontend Client
cd ../client
npm install
```

### 3) Database Migration & Idempotent Seed
```bash
cd server
npx prisma migrate deploy
npm run prisma:seed
```

### 4) Run Development Servers
```bash
# Terminal 1: Backend API (http://localhost:3000)
cd server
npm run dev

# Terminal 2: Frontend App (http://localhost:5173)
cd client
npm run dev
```

---

## 🔐 Demo Accounts (Default Password: `Password123!`)

| Role | Name | Email | Notes |
|---|---|---|---|
| **Requester** | Jennifer Anderson | `jennifer.anderson@example.com` | Owns active & multi-action tickets |
| **Requester** | Michael Brown | `michael.brown@example.com` | Owns unassigned & waiting tickets |
| **Requester** | David Lee | `david.lee@example.com` | `requiresPasswordChange: true` |
| **IT Staff** | Kevin Patel | `kevin.patel@toktickit.com` | Primary ticket owner & performer |
| **IT Staff** | Lisa Martinez | `lisa.martinez@toktickit.com` | Collaborative IT Staff performer |
| **IT Staff** | Robert Wilson | `robert.wilson@toktickit.com` | Collaborative IT Staff performer |
| **Administrator** | John Smith | `john.smith@toktickit.com` | Full Staff + Admin User Summary & Management |

---

## 🧪 Running Automated Tests

```bash
# 1. Server Unit, API & Full Regression Suite (Labs 1–4: 18 files, 48 tests)
cd server
npm test -- --fileParallelism=false

# 2. Client UI Component & Regression Suite (Labs 1–4: 8 files, 25 tests)
cd client
npm test

# 3. End-to-End Playwright Suite (Lab 4: 3 files, 6 E2E flows)
npm run test:e2e
```

---

## 📌 Lab 4 Feature Summary

* **Actions Taken Work Log & Collaborative Attribution (`FR-01`–`FR-05`, `BR-01`–`BR-06`, `BR-15`–`BR-16`):**
  * IT Staff and Administrators record chronological troubleshooting entries (`ActionTaken`) on any ticket.
  * `performedById` is automatically bound to the authenticated staff member and decoupled from `Ticket.ownerId` to support multi-staff collaboration.
  * Conditional validation requires a non-empty `followUpNote` whenever `followUpRequired = true`.
  * Requesters view a read-only work log on their own tickets and are blocked (`403 Forbidden`) from creating/modifying actions or viewing other users' tickets.
* **Ticket Lifecycle State Machine, Resolution Gate & Optimistic Concurrency (`FR-06`–`FR-08`, `BR-07`–`BR-10`, `BR-14`):**
  * Enforces valid status transitions (`NEW`, `OPEN`, `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CLOSED`, `REOPENED`, `CANCELLED`).
  * **Resolution Gate (`BR-08`)**: Only IT Staff and Administrators can transition tickets to `RESOLVED` or `CLOSED`.
  * **Requester Advisory Workflow (`BR-09`)**: Requesters can click **"Problem Appears Resolved"** to set `requesterResolvedInd = true` and append an automated Public Comment without prematurely closing the ticket; IT Staff see an **Advisory Banner** with a **"Formally Resolve Ticket"** shortcut.
  * **Optimistic Concurrency (`BR-10`)**: Stale `lastUpdatedAt` timestamps are rejected with `HTTP 409 Conflict` and surface a refresh banner in the UI.
* **Role-Based Dashboards & Interactive Queue Drill-Down (`FR-09`–`FR-11`, `BR-11`–`BR-13`):**
  * **IT Staff / Admin Dashboard**: Displays live backend-aggregated counts (`Unassigned`, `Open`, `In Progress`, `Waiting for Requester`, `Assigned to Me`), IT Priority breakdown, Recent Tickets, and an Admin-only **System User Summary** (`FR-11`). Clicking any metric card drills down into the Ticket Queue with preset filters (`AC-14`).
  * **Requester Dashboard**: Strictly isolated to the logged-in requester (`WHERE requesterId = currentUser.id`), displaying `Open Tickets`, `Waiting on Me`, `Resolved`, and `Closed` counts with graceful zero-value handling (`0`).
