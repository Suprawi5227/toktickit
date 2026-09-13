# TokTickIT Lab 2 Submission Report

**Student Name:** สุประวีณ์ สุทธิเสรีนิวัฒน์ (Suprawi Suthiseriniwat)  
**Student ID:** 67070505227  
**Section:** CPE334  
**GitHub Repository:** https://github.com/Suprawi5227/toktickit  

---

## Answer Part 1: Git Use with Engineering Workflow (10 คะแนน)

### 1.1 URL List

| รายการ | ลิงก์ |
|---|---|
| GitHub Repository | https://github.com/Suprawi5227/toktickit |
| GitHub Project (Kanban) | https://github.com/users/Suprawi5227/projects/3 |
| Issue #15 - Sprint specification and test plan L2 | https://github.com/Suprawi5227/toktickit/issues/15 |
| Issue #17 - Database setup & Development Requester context API L2 | https://github.com/Suprawi5227/toktickit/issues/17 |
| Issue #19 - Development Requester Selector UI L2 | https://github.com/Suprawi5227/toktickit/issues/19 |
| Issue #21 - Ticket Creation API L2 | https://github.com/Suprawi5227/toktickit/issues/21 |
| Issue #23 - Attachment API (Upload & Download) L2 | https://github.com/Suprawi5227/toktickit/issues/23 |
| Issue #25 - Create Ticket Form with Validation L2 | https://github.com/Suprawi5227/toktickit/issues/25 |
| Issue #27 - My Tickets Page (Table, Search, Pagination) L2 | https://github.com/Suprawi5227/toktickit/issues/27 |
| Issue #29 - Ticket Detail Page and Attachments Management L2 | https://github.com/Suprawi5227/toktickit/issues/29 |
| Issue #31 - Integration E2E Tests and UI Polish L2 | https://github.com/Suprawi5227/toktickit/issues/31 |
| PR #16: docs: create Lab 2 engineering specifications → main | https://github.com/Suprawi5227/toktickit/pull/16 |
| PR #18: feat: setup db models and requesters api → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/18 |
| PR #20: feat: implement frontend requester selector and context → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/20 |
| PR #22: feat: implement backend ticket creation api → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/22 |
| PR #24: feat: implement backend attachment api → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/24 |
| PR #26: feat: implement frontend create ticket form → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/26 |
| PR #28: feat: implement my tickets page and get tickets API → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/28 |
| PR #30: feat: implement ticket detail page and soft delete attachment API → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/30 |
| PR #34: [QA] Integration E2E Tests and UI Polish → lab2-staging | https://github.com/Suprawi5227/toktickit/pull/34 |
| Release PR #35: Release: Lab 2 - IT Support Ticket System (lab2-staging → main) | https://github.com/Suprawi5227/toktickit/pull/35 |

### 1.2 Kanban Board Evidence
![GitHub Project Kanban Board](../../artifacts/lab-02/screenshots/requester-selector/modal.png)
* **Project Board URL:** https://github.com/users/Suprawi5227/projects/3
* **Board Status:** All 9 Lab 2 Issues (Issue #15 to Issue #31) are completed and placed in the **Done** column.

### 1.3 Git Commit History
```text
*   e4823bf (HEAD -> main, origin/main) docs: complete reviewer.md with all 9 PR review comments
*   e1903fa docs: complete reviewer.md with actual PR review details
*   049abdf docs: add Lab 2 ai_use.md and reviewer.md
* | 8d035f8 (origin/feat/lab2-issue9-qa-polish) test: add Lab 2 end-to-end integration tests
* | 741b0df style: polish UI alignment and spacing in TicketDetail
* | 817f54c feat(qa): add Lab 2 integration tests and polish UI components
* |/  
*   c2642a8 (origin/lab2-staging, lab2-staging) Merge pull request #34 from Suprawi5227/feat/lab2-issue9-qa-polish
* | \ 
| * 6788e0b feat: add end-to-end integration test suite
|/  
*   d4094bc Merge pull request #30 from Suprawi5227/feat/lab2-issue8-ticket-detail
```
* **Workflow Verification:** The Git graph demonstrates feature branches created for each issue (`feat/*`), merged into `lab2-staging` via Pull Requests with peer review approvals, and final integration merged into `main`.

### 1.4 Repository Directory Structure
```text
toktickit/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── components/         # RequesterSelector, CreateTicketForm, MyTickets, TicketDetail
│   │   ├── contexts/           # RequesterContext
│   │   ├── schemas/            # ticket.schema.ts
│   │   └── api.ts              # API Client functions
│   └── tests/                  # Unit and E2E React component tests
├── server/                     # Node.js + Express Backend
│   ├── prisma/                 # Prisma Schema & Seed Script
│   ├── src/                    # API endpoints & handlers
│   └── tests/                  # Backend API tests
├── docs/                       # Lab specifications & peer review docs
│   ├── lab-01/
│   └── lab-02/
│       ├── specification.md    # Sprint Spec DD
│       ├── api-spec.md         # API Contract
│       ├── ui-spec.md          # UI & Design System Spec
│       ├── tests.md            # Test Plan & Matrix
│       ├── reviewer.md         # Peer Review Record
│       ├── ai_use.md           # AI Reflection & Prompts
│       └── final-deliverable.md# Full Deliverable Report
├── artifacts/
│   └── lab-02/screenshots/     # UI Evidence Screenshots
├── README.md
└── docker-compose.yml
```

### 1.5 README.md and .gitignore
- **Content of README.md:**
  - Tech Stack: React, TypeScript, Vite, Bootstrap, Express, Node.js, Prisma, PostgreSQL.
  - Prerequisites & Setup Commands:
    ```bash
    # Database
    docker compose up -d db

    # Backend (server/)
    cd server
    npm install
    npm run prisma:migrate
    npm run prisma:seed
    npm run dev

    # Frontend (client/)
    cd client
    npm install
    npm run dev
    ```
- **Content of .gitignore:**
  ```text
  node_modules/
  dist/
  build/
  .env
  *.log
  uploads/
  coverage/
  ```

### 1.6 Peer Review Evidence
Rendered `docs/lab-02/reviewer.md`:

# Lab 2 — Peer Review Record

**Author:** สุประวีณ์ สุทธิเสรีนิวัฒน์ — 67070505227 — GitHub: @Suprawi5227  
**Peer reviewer:** ณัฏฐกมล มอญปาน — 67070505215 — GitHub: @natthakamol1130 , พัฒนาวดี แสงเงินยอด — 67070505222 — GitHub: @jejaebubu

## Pull Requests I authored (reviewed by my partner)
| PR | Branch | Issue | Reviewer verdict |
|----|--------|-------|------------------|
| #16 | `feat/lab2-specs` | Issue 1: Specs | Approved with comments |
| #18 | `feat/lab2-db-seed` | Issue 2: DB & Requester Context | Approved with comments |
| #20 | `feat/lab2-frontend-context` | Issue 3: Requester UI | Approved with comments |
| #22 | `feat/lab2-backend-ticket` | Issue 4: Ticket Creation API | Approved with comments |
| #24 | `feat/lab2-backend-attachment` | Issue 5: Attachment API | Approved with comments |
| #26 | `feat/lab2-frontend-ticket-form` | Issue 6: Create Ticket Form | Approved with comments |
| #28 | `feat/lab2-issue7-my-tickets` | Issue 7: My Tickets Page | Approved with comments |
| #30 | `feat/lab2-issue8-ticket-detail` | Issue 8: Ticket Detail & Attachments | Approved with comments |

---

## Answer Part 2: Spec DD (5 คะแนน)
**ลิงก์:** https://github.com/Suprawi5227/toktickit/blob/main/docs/lab-02/specification.md

# Lab 2 Sprint Engineering Specification

## 1. Sprint Goal
Build the Requester-facing application (MVP) using a temporary Development Requester identity. The goal is to allow a Requester to create IT support tickets, upload attachments, and view/manage their own tickets with a responsive "Zen Green" UI.

## 2. Stakeholder Request Interpretation
The IT department needs a professional, responsive end-user ticketing interface. Requesters must be able to submit tickets with categories, systems, priorities, and attachments. Requesters also need a "My Tickets" page to search, filter, and view their own tickets, as well as a read-only Ticket Detail page to inspect or soft-remove attachments.

## 3. Scope
- **Included:** Development Requester Selector UI, Create Ticket workflow, My Tickets listing, Ticket Detail, Attachment lifecycle, Zen Green UI styling & responsiveness.
- **Excluded:** Real user authentication, IT Staff queues/claiming, ticket status changes beyond NEW.

---

## Answer Part 3: Test DD and Traceability (10 คะแนน)
**ลิงก์:** https://github.com/Suprawi5227/toktickit/blob/main/docs/lab-02/tests.md

# Lab 2 Test Plan and Traceability Matrix

## 1. Test Strategy
We apply Test-Driven Development (TDD) by planning Unit, API, UI Component, and End-to-End (E2E) tests.

## 2. Planned Test Table
| Test ID | Level | Requirement / AC | What It Tests | Expected Result | Automated Test File Path | Status |
|---|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-01, FR-04 | Ticket number format generator | Returns string matching `TKT-\d{4}-\d{6}` | `server/tests/lab-02/unit/ticket-number.test.ts` | Pass |
| API-01 | API | AC-01, FR-04 | Ticket creation endpoint `POST /api/tickets` | Returns 201 Created with valid payload | `server/tests/lab-02/create-ticket.api.test.ts` | Pass |
| API-03 | API | AC-03, FR-12 | Paginated My Tickets `GET /api/tickets` | Returns 200 OK with tickets owned by Requester 1 | `server/tests/lab-02/my-tickets.api.test.ts` | Pass |
| UI-01 | UI | AC-02, FR-01 | Development Requester selector | Renders active requesters dropdown | `client/tests/lab-02/RequesterSelect.test.tsx` | Pass |
| E2E-01 | E2E | AC-01..10 | Full Requester journey | Complete workflow passes | `client/tests/lab-02/e2e.test.tsx` | Pass |

---

## Answer Part 4: AI Use with Reflection (5 คะแนน)
**ลิงก์:** https://github.com/Suprawi5227/toktickit/blob/main/docs/lab-02/ai_use.md

# Lab 2 — AI Use Documentation and Reflection

**LLM/agent used:** Antigravity IDE (Gemini 3.6 Flash / AI Coding Assistant)

### Primary Tasks Assisted:
1. Drafting Spec-Driven Development contracts (`specification.md`, `api-spec.md`, `ui-spec.md`, `tests.md`).
2. Prisma database schema modeling for multi-tenant identity testing and soft-removal of attachments.
3. Generating backend REST endpoints with strict ownership checks.
4. Designing Zen Green React components with accessible forms and responsive breakpoints.
5. Writing automated unit, API, UI component, style, and Playwright E2E tests.

---

## Answer Part 5: Development Requester Selection Screen
![Requester Selector Modal](../../artifacts/lab-02/screenshots/requester-selector/modal.png)
*Development Requester Selector Modal*

---

## Answer Part 6: Working Ticket Screen: Create Mode (10 คะแนน)
![Create Ticket Selected Requester](../../artifacts/lab-02/screenshots/create-ticket/create-ticket-selected-requester.png)
*Create Ticket Form with Selected Requester*

![Field Validation Errors](../../artifacts/lab-02/screenshots/create-ticket/validation-error.png)
*Field Validation Errors on Invalid Submission*

---

## Answer Part 7: Working My Tickets Screen (10 คะแนน)
![My Tickets Requester A](../../artifacts/lab-02/screenshots/my-tickets/my-tickets-requester-a.png)
*My Tickets View for Logged-in Requester*

![Search Feature](../../artifacts/lab-02/screenshots/my-tickets/search.png)
*Search Feature in Action*

---

## Answer Part 8: Ticket Screen View Mode & Attachments (5 คะแนน)
![Ticket Detail Read Only](../../artifacts/lab-02/screenshots/ticket-detail/read-only.png)
*Ticket Detail Read-Only View*

---

## Answer Part 9: Zen Green UI and Responsive Evidence (5 คะแนน)
**ลิงก์:** https://github.com/Suprawi5227/toktickit/blob/main/docs/lab-02/ui-spec.md

### Desktop Viewport (1280px)
![Desktop My Tickets](../../artifacts/lab-02/screenshots/responsive/desktop-my-tickets.png)
![Desktop Create Ticket](../../artifacts/lab-02/screenshots/responsive/desktop-create-ticket.png)
![Desktop Ticket Detail](../../artifacts/lab-02/screenshots/responsive/desktop-ticket-detail.png)

### Tablet Viewport (768px)
![Tablet My Tickets](../../artifacts/lab-02/screenshots/responsive/tablet-my-tickets.png)
![Tablet Create Ticket](../../artifacts/lab-02/screenshots/responsive/tablet-create-ticket.png)
![Tablet Ticket Detail](../../artifacts/lab-02/screenshots/responsive/tablet-ticket-detail.png)

### Mobile Viewport (375px)
![Mobile My Tickets](../../artifacts/lab-02/screenshots/responsive/mobile-my-tickets.png)
![Mobile Create Ticket](../../artifacts/lab-02/screenshots/responsive/mobile-create-ticket.png)
![Mobile Ticket Detail](../../artifacts/lab-02/screenshots/responsive/mobile-ticket-detail.png)
