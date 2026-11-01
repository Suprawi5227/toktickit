# Lab 4 Test Plan and Traceability Matrix

## 1. Test Strategy
Adhering to Test-Driven Development (TDD), this test plan defines the testing strategy, test fixtures, automated suites, and Acceptance Criteria (AC) traceability for Sprint 4. The test framework covers five coordinated layers:
1. **Unit Layer**: In-memory validation logic (`followUpRequired = true` -> non-empty `followUpNote`) and State Machine lifecycle transition rule evaluation per BR-07.
2. **API & Integration Layer (Supertest & Vitest)**: Authoritative RESTful endpoints for Actions Taken CRUD, status lifecycle transitions, resolution gate enforcement, inactive user safety (`BR-14`), optimistic concurrency conflict detection (`409 Conflict`), and backend-aggregated dashboard calculations.
3. **UI Component Layer (React Testing Library & Vitest)**: Client-side rendering of Actions Taken timelines, role-based controls (IT Staff action modal vs Requester read-only view), status transition selectors, advisory banners, and dashboard metric cards under the Zen Green design system.
4. **End-to-End System Layer (Playwright)**: Full browser workflows covering multi-user collaboration (collaborative action logging), the complete Requester Advisory -> IT Staff Formal Resolution lifecycle, and dashboard drill-down filtering.
5. **Full Sprint Regression Layer**: Automated regression suites ensuring zero degradation of features built in Labs 1, 2, and 3 (FR-12).

---

## 2. Automated Test Matrix & Execution Status

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
|---|---|---|---|---|---|---|
| **UNIT-01** | Unit | AC-02, BR-04 | Validation logic for followUpNote conditional requirement | Throws / returns validation error if required note is whitespace or missing | `server/tests/lab-04/unit-validators.test.ts` | Passed |
| **UNIT-02** | Unit | AC-08, AC-09, BR-07 | Ticket state transition matrix validator helper | Returns allowed next states; rejects illegal transitions | `server/tests/lab-04/unit-validators.test.ts` | Passed |
| **API-01** | API | AC-01, FR-01, FR-02 | Create Action Taken as IT Staff | Action persisted with `performedById = session.userId`; HTTP 201 Created | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-02** | API | AC-02, FR-03, BR-04 | Action with `followUpRequired=true` & empty note | HTTP 400 Bad Request with explicit validation message | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-03** | API | AC-03, FR-04, BR-05 | Requester attempting to create Action Taken | HTTP 403 Forbidden; write blocked | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-04** | API | AC-04, BR-06 | Requester fetching Actions Taken of unowned ticket | HTTP 403 Forbidden; no sensitive data leaked | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-05** | API | AC-04, FR-04 | Requester fetching Actions Taken for own ticket | HTTP 200 OK; read-only list of actions returned | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-06** | API | AC-05, FR-05, BR-02 | Collaborative work: IT Staff B logs action on ticket owned by Staff A | HTTP 201 Created; performer is Staff B, ticket owner remains Staff A | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-07** | API | BR-10, Section 1.3 | Update Action Taken with Optimistic Concurrency check | HTTP 200 OK on valid timestamp; HTTP 409 Conflict on stale timestamp | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-08** | API | BR-15, Section 1.4 | Fetch single Action Taken by ID | HTTP 200 OK with full action payload; HTTP 404 if not found | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-09** | API | BR-16 | Attempt DELETE on Action Taken | HTTP 404 / 405 (Method Not Allowed); deletion prohibited | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-10** | API | BR-14 | Action Taken attribution with inactive IT Staff account | HTTP 400 Bad Request; safety check prevents assignment | `server/tests/lab-04/actions-taken.api.test.ts` | Passed |
| **API-11** | API | AC-06, FR-07, BR-08 | Requester attempting to set Ticket to `RESOLVED` directly | HTTP 403 Forbidden; resolution gate strictly enforced | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-12** | API | AC-07, BR-09 | Requester "Problem Appears Resolved" advisory flag | HTTP 200 OK; `requesterResolvedInd = true`, Public Comment created, status unchanged | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-13** | API | AC-08, FR-06, BR-07 | IT Staff valid lifecycle transition (`OPEN` -> `IN_PROGRESS` -> `RESOLVED`) | HTTP 200 OK; status updated and persisted | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-14** | API | AC-09, FR-06, BR-07 | Illegal status transition (e.g. `NEW` -> `RESOLVED` or `CLOSED` -> `RESOLVED`) | HTTP 400 Bad Request; invalid transition rejected | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-15** | API | AC-10, FR-08, BR-10 | Ticket status update with stale `lastUpdatedAt` | HTTP 409 Conflict with latest record data | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-16** | API | BR-14 | Reassigning ticket to inactive user (`isActive = false`) | HTTP 400 Bad Request; blocked by assignee safety check | `server/tests/lab-04/ticket-workflow.api.test.ts` | Passed |
| **API-17** | API | AC-11, FR-09 | IT Staff Dashboard metrics aggregation (`unassignedCount`, `assignedToMeCount`, status) | HTTP 200 OK; live counts matching database records | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **API-18** | API | FR-11 | Admin user accessing IT Staff Dashboard with `userSummary` | HTTP 200 OK; includes total, active, and role counts | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **API-19** | API | FR-09 | Requester attempting access to Staff Dashboard | HTTP 403 Forbidden; staff operational views secured | `server/tests/lab-04/staff-dashboard.api.test.ts` | Passed |
| **API-20** | API | AC-12, FR-10, BR-12 | Requester Dashboard data isolation (`waitingOnMeCount`, `openCount`) | HTTP 200 OK; metrics strictly bound to authenticated requester | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **API-21** | API | AC-13, BR-13 | Dashboard calculation with zero ticket counts | HTTP 200 OK; returns numeric `0` without null or calculation errors | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **API-22** | API | FR-10 | Unauthenticated request to Requester Dashboard | HTTP 401 Unauthorized; session authentication required | `server/tests/lab-04/requester-dashboard.api.test.ts` | Passed |
| **UI-01** | UI | AC-01, FR-01 | Render Actions Taken list on Ticket Detail | Action rows show date/time, performer badge, description, result, follow-up pill | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-02** | UI | AC-02, FR-03 | Add Action Taken modal form validation | Requires `followUpNote` when `followUpRequired` is checked; disables submit on error | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-03** | UI | AC-03, FR-04 | Actions Taken view for Requester | Read-only presentation; "Add Action Taken" and edit buttons are hidden | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-04** | UI | AC-13 | Empty state rendering for zero Actions Taken | Clean empty state card rendered without errors | `client/tests/lab-04/ActionsTaken.test.tsx` | Passed |
| **UI-05** | UI | AC-08, FR-06 | Ticket Detail Status Selector | Shows only permitted status transitions according to current ticket state | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-06** | UI | AC-07, BR-09 | Requester Advisory Button & IT Staff Advisory Banner | Requester sees "Problem Appears Resolved"; IT Staff sees Advisory Banner | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-07** | UI | Section 1 | Reopened Ticket Status Badge | Renders Teal badge (`#20C997`, bg `#E6FAF4`) | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-08** | UI | AC-10, FR-08 | Concurrency Conflict Alert Banner | Displays prompt with "Refresh Ticket" button on HTTP 409 | `client/tests/lab-04/TicketWorkflow.test.tsx` | Passed |
| **UI-09** | UI | AC-11, FR-09 | IT Staff Dashboard stat cards (`unassignedCount`, status cards) | Renders 5 metric cards with Zen Green theme | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-10** | UI | AC-14 | IT Staff Dashboard drill-down navigation | Clicking card navigates to Ticket Queue with preset filter query | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-11** | UI | FR-09 | IT Staff Dashboard Recent Tickets list | Renders list with quick action buttons | `client/tests/lab-04/StaffDashboard.test.tsx` | Passed |
| **UI-12** | UI | AC-12, FR-10 | Requester Dashboard stat cards (`waitingOnMeCount`, `openCount`) | Renders 4 requester metric cards | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **UI-13** | UI | AC-13, BR-13 | Requester Dashboard zero-count graceful display | Displays numeric `0` without broken layout | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **UI-14** | UI | FR-10 | Requester Dashboard Recent Tickets table | Renders recent tickets table with direct navigation | `client/tests/lab-04/RequesterDashboard.test.tsx` | Passed |
| **E2E-01** | E2E | AC-01, AC-02, AC-05 | Actions Taken Recording & Performer Collaboration | IT Staff logs actions, collaborative staff adds follow-up, verified in ticket log | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| **E2E-02** | E2E | AC-03, AC-04 | Requester read-only actions timeline | Verifies no action form or edit controls are accessible to requester | `e2e/lab-04/actions-taken-flow.spec.ts` | Passed |
| **E2E-03** | E2E | AC-06, AC-07, AC-08 | Ticket Resolution Gate & Advisory Workflow | Requester indicates resolved -> IT Staff inspects banner -> Formal resolution | `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| **E2E-04** | E2E | AC-06 | Resolution gate client and API enforcement | Verifies Requester cannot force RESOLVED transition | `e2e/lab-04/ticket-resolution.spec.ts` | Passed |
| **E2E-05** | E2E | AC-11, AC-14 | IT Staff Dashboard Live Metrics & Queue Drill-Down | Verifies live counts and filter persistence on card click | `e2e/lab-04/dashboards.spec.ts` | Passed |
| **E2E-06** | E2E | AC-12, AC-13 | Requester Dashboard Data Isolation | Verifies metrics strictly scoped to user and zero-count integrity | `e2e/lab-04/dashboards.spec.ts` | Passed |
| **REG-01** | Regression | FR-12 | Lab 1 Sprint Regression Suite | Categories API, health check, database seed integrity | `server/tests/lab-01/`, `client/tests/lab-01/` | Passed |
| **REG-02** | Regression | FR-12 | Lab 2 Sprint Regression Suite | Requesters, ticket creation, attachments, soft delete | `server/tests/lab-02/`, `client/tests/lab-02/` | Passed |
| **REG-03** | Regression | FR-12 | Lab 3 Sprint Regression Suite | Auth, RBAC, password change, staff queue, notes/comments, user admin | `server/tests/lab-03/`, `client/tests/lab-03/` | Passed |

---

## 3. Acceptance-Criterion Traceability Matrix

| Acceptance Criterion | Description | Covered by Automated Tests |
|---|---|---|
| **AC-01** | Create Action Taken with authenticated performer attribution | `API-01`, `UI-01`, `E2E-01` |
| **AC-02** | Conditional validation: `followUpRequired=true` requires `followUpNote` | `UNIT-01`, `API-02`, `UI-02`, `E2E-01` |
| **AC-03** | Requesters blocked from creating or modifying Actions Taken (HTTP 403) | `API-03`, `UI-03`, `E2E-02` |
| **AC-04** | Requester ownership isolation on Actions Taken retrieval | `API-04`, `API-05`, `UI-03`, `E2E-02` |
| **AC-05** | Collaborative performer attribution distinct from ticket owner | `API-06`, `E2E-01` |
| **AC-06** | Formal Resolution Gate: Requesters cannot set ticket to `RESOLVED` (HTTP 403) | `API-11`, `E2E-03`, `E2E-04` |
| **AC-07** | Advisory Resolution: sets `requesterResolvedInd=true`, keeps status unchanged | `API-12`, `UI-06`, `E2E-03` |
| **AC-08** | Permitted status transitions execute successfully for IT Staff | `UNIT-02`, `API-13`, `UI-05`, `E2E-03` |
| **AC-09** | Invalid or out-of-order status transitions rejected with HTTP 400 | `UNIT-02`, `API-14`, `UI-05` |
| **AC-10** | Optimistic concurrency conflict detection returns HTTP 409 Conflict | `API-07`, `API-15`, `UI-08` |
| **AC-11** | IT Staff Dashboard returns backend-computed live metrics (`unassignedCount`) | `API-17`, `UI-09`, `E2E-05` |
| **AC-12** | Requester Dashboard metrics strictly isolated to current user (`waitingOnMeCount`) | `API-20`, `UI-12`, `E2E-06` |
| **AC-13** | Zero-value metric handling renders `0` cleanly without errors | `API-21`, `UI-04`, `UI-13`, `E2E-06` |
| **AC-14** | Dashboard metric cards support interactive drill-down navigation | `UI-10`, `E2E-05` |

---

## 4. Test Execution Commands

```bash
# Server Unit & API Tests
cd server && npm test -- tests/lab-04/

# Client UI Component Tests
cd client && npm test -- tests/lab-04/

# End-to-End Playwright Tests
npx playwright test e2e/lab-04/

# Full Sprint Regression Suite (FR-12: REG-01, REG-02, REG-03)
cd server && npm test
cd client && npm test
```
