# Lab 3 Test Plan and Traceability Matrix

## 1. Test Strategy
We apply Test-Driven Development (TDD) by establishing Unit, API/Integration, UI Component, and End-to-End (E2E) test cases before implementation. Test coverage spans Authentication, Role-based Navigation, Direct API Authorization, IT Staff Queue/Detail workflows, Public Comments & Internal Notes, Administrator User Management, and Data Migration regression.

---

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| **API-01** | API | AC-01, BR-01 | Valid User Login | Authenticated response, session cookie set, user data & role returned | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-02** | API | BR-01, AC-12 | Login with Inactive Account | HTTP 401 Unauthorized; safe error message | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-03** | API | AC-02, BR-02 | Login with `requiresPasswordChange = true` | First-login flag returned; password change required | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-04** | API | AC-03, BR-03 | Requester accessing unowned ticket | HTTP 403 Forbidden; no other user data returned | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **API-05** | API | AC-04, BR-04 | Requester requesting Internal Notes | HTTP 403 Forbidden; note content not exposed | `server/tests/lab-03/notes.api.test.ts` | Pass |
| **API-06** | API | AC-05, FR-05 | IT Staff Ticket Queue query with search & filter | HTTP 200 OK; paginated matching tickets returned | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| **API-07** | API | AC-06, FR-06 | IT Staff claiming unassigned ticket | HTTP 200 OK; `ownerId` set to current IT Staff, status updated | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-08** | API | AC-07, FR-10 | Requester "Problem Appears Resolved" action | HTTP 200 OK; `requesterResolvedInd = true`, Public Comment created | `server/tests/lab-03/comments-notes.api.test.ts` | Pass |
| **API-09** | API | AC-09, BR-09 | Admin creating user with duplicate email | HTTP 409 Conflict / 400 Bad Request; validation error | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-10** | API | AC-10, BR-10 | Admin deactivating own account | HTTP 400 Bad Request; operation blocked with safety error | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-11** | API | AC-11, BR-11 | Admin deactivating last active Admin | HTTP 400 Bad Request; operation blocked | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **UI-01** | UI | AC-01, FR-03 | Auth App Shell rendering | Shows full name, role badge, profile actions & logout button | `client/.../lab-03 tests/Login.test.tsx` | Pass |
| **UI-02** | UI | AC-02, BR-02 | Mandatory Change Password Screen | Input form shown; blocks navigation until password changed | `client/.../lab-03 tests/ChangePassword.test.tsx` | Pass |
| **UI-03** | UI | AC-05, FR-05 | IT Staff Ticket Queue filters & search | Table updates according to search text and filter selection | `client/.../lab-03 tests/StaffTicketQueue.test.tsx` | Pass |
| **UI-04** | UI | AC-06, BR-04 | IT Ticket Detail Public vs Internal Notes UI | Public Comments white/green card vs Internal Notes amber card | `client/.../lab-03 tests/StaffTicketDetail.test.tsx` | Pass |
| **UI-05** | UI | AC-08, FR-11 | Admin User Management Table & Search | User listing rendered; search & role filter filter list | `client/.../lab-03 tests/UserManagement.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-02 | Authentication & Password Change Flow | Full login -> password change -> shell navigation flow | `e2e/lab-03/authentication.spec.ts` | Pass |
| **E2E-02** | E2E | AC-05, AC-06 | IT Staff Ticket Queue & Ownership Flow | Queue -> Open Detail -> Claim Ticket -> Post Note flow | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-08, AC-09 | Admin User Creation & Management Flow | User Management -> Create User -> Edit Role & Status | `e2e/lab-03/user-administration.spec.ts` | Pass |

---

## 3. Acceptance-Criterion Traceability

| AC ID | Covered by Tests |
|---|---|
| **AC-01** | API-01, UI-01, E2E-01 |
| **AC-02** | API-03, UI-02, E2E-01 |
| **AC-03** | API-04 |
| **AC-04** | API-05, UI-04 |
| **AC-05** | API-06, UI-03, E2E-02 |
| **AC-06** | API-07, E2E-02 |
| **AC-07** | API-08 |
| **AC-08** | UI-05, E2E-03 |
| **AC-09** | API-09, E2E-03 |
| **AC-10** | API-10 |
| **AC-11** | API-11 |
| **AC-12** | API-02 |

---

## 4. Responsive and Visual Checklist
- [x] Multi-column layout applied on Desktop (≥ 992 px) for IT Queue and User Management.
- [x] Forms stack vertically on Mobile (< 768 px).
- [x] Clear visual distinction between Public Comments (white/green border) and Internal Notes (amber card).
- [x] Role Badges (`Requester`, `IT Staff`, `Admin`) visible in Header and Tables.
- [x] "Zen Green" color palette applied consistently across all new Lab 3 screens.

---

## 5. Automated Test Commands
- **Server API & Unit Tests**: `npm run test:server` or `npx vitest run server/tests/lab-03/`
- **Client UI Tests**: `npm run test:client` or `npx vitest run client/`
- **End-to-End Tests**: `npx playwright test e2e/lab-03/`
