# Lab 3 Sprint Engineering Specification

## 1. Sprint Goal
Deliver secure authentication, role-based authorization (Requester, IT Staff, Administrator), an operational IT Staff Ticket Queue and Detail workflow, and minimalist Administrator User Management, while preserving all existing Lab 2 ticket and attachment functionality under authentic user identities.

## 2. Stakeholder Request Interpretation
The temporary Development Requester selector was useful for MVP development, but the system now requires real authenticated users. Administrators need a minimalist User Management screen to view users, create accounts with one permitted role, update basic account details, activate/deactivate accounts, and issue initial passwords that must be changed upon first login. IT Staff require a dedicated Ticket Queue and Ticket Detail screen to claim or reassign tickets, set IT Priority, update ticket status, post Public Comments, and record private Internal Notes. Requesters must continue using Lab 2 ticket features under their authenticated identity and be able to post Public Comments or mark a problem as resolved, without directly resolving or closing tickets themselves. All APIs and screens must enforce role and ownership protection on the server side.

## 3. Scope

### Included
- Secure authentication (email & password), logout, current user session retrieval, and mandatory first-login password change.
- Server-side Role-Based Access Control (RBAC) for Requester, IT Staff, and Administrator roles.
- Migration from `DevelopmentRequester` model to authenticated `User` model without losing Lab 2 ticket or attachment data.
- Removal of the temporary Development Requester selector UI and client-side mock state.
- IT Staff Ticket Queue with search, filters (Status, IT Priority), sorting, pagination, and assigned/unassigned ownership indicators.
- IT Staff Ticket Detail with claim/reassign ownership, IT Priority assignment, status workflow transitions, Public Comments, Internal Notes, and attachment management.
- Requester Ticket Detail extensions: Public Comments, and "Problem Appears Resolved" indication.
- Minimalist Administrator User Management: user listing with search/filter, account creation, account editing (name, email, role, active status), and initial password resetting.
- Safe error handling without information leakage (e.g., distinguishing 401 Unauthenticated, 403 Forbidden, 404 Not Found).
- Zen Green design language extension and responsive layout support for all screens.

### Excluded
- Email invitations, password-reset emails, MFA, social login, and SSO.
- Self-registration / public signup.
- Actions Taken by IT Staff (deferred to Lab 4).
- Formal SLA calculations, escalation rules, and automated notifications.
- Advanced dashboards, analytics, multi-tenant/department hierarchies, profile photos, and role history.
- Account deletion, bulk user operations, import/export, and multi-role assignments.

---

## 4. Functional Requirements
- **FR-01**: The system shall authenticate users using email and password, establishing a secure authenticated session.
- **FR-02**: The system shall enforce a mandatory password change screen upon first login for users flagged with `requiresPasswordChange`.
- **FR-03**: The system shall replace the Development Requester selector with the authenticated user's name, role badge, profile actions, and logout option.
- **FR-04**: The system shall allow Requesters to create, view, and manage only their owned Tickets and Attachments.
- **FR-05**: The system shall provide an IT Staff Ticket Queue supporting keyword search, status filtering, priority filtering, column sorting, and pagination.
- **FR-06**: The system shall allow IT Staff to view any Ticket Detail, claim unassigned tickets, or reassign tickets to active IT Staff or Administrator users.
- **FR-07**: The system shall allow IT Staff to update IT Priority and perform permitted status transitions according to the status workflow matrix.
- **FR-08**: The system shall support append-only Public Comments on Tickets, visible to Requesters, IT Staff, and Administrators.
- **FR-09**: The system shall support append-only Internal Notes on Tickets, visible exclusively to IT Staff and Administrators.
- **FR-10**: The system shall allow Requesters to indicate "Problem Appears Resolved" on their owned tickets without changing the status directly to Resolved or Closed.
- **FR-11**: The system shall provide an Administrator User Management screen to list, search (by name/email), and filter (by role) user accounts.
- **FR-12**: The system shall allow Administrators to create a new user account with a name, email, one permitted role, activation state, and initial password.
- **FR-13**: The system shall allow Administrators to edit a user's name, email, role, and activation state.
- **FR-14**: The system shall allow Administrators to issue/reset an initial password for a user, which flags `requiresPasswordChange = true`.

---

## 5. Business Rules
- **BR-01**: Only an active user (`isActive = true`) with valid credentials may authenticate.
- **BR-02**: A user marked as requiring a password change (`requiresPasswordChange = true`) cannot enter normal application screens until a valid new password is saved.
- **BR-03**: The authenticated user identity, not a client-supplied ID parameter, determines ownership of Requester operations.
- **BR-04**: Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator.
- **BR-05**: A Requester may indicate that a problem appears resolved, but cannot formally set the Ticket status to Resolved or Closed. Formally resolving or closing tickets is restricted to IT Staff and Administrators.
- **BR-06**: Each Ticket may have zero or one primary Ticket Owner (an active IT Staff or Administrator).
- **BR-07**: Requested Priority is submitted by the Requester and remains unchanged. IT Priority initially copies Requested Priority and may later be modified only by IT Staff or Administrator.
- **BR-08**: Permitted Ticket status transitions are:
  - `NEW` -> `OPEN`, `IN_PROGRESS`, `CANCELLED`
  - `OPEN` -> `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - `IN_PROGRESS` -> `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED`
  - `WAITING_FOR_REQUESTER` -> `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
  - `RESOLVED` -> `CLOSED`, `REOPENED`
  - `CLOSED` -> `REOPENED`
  - `REOPENED` -> `IN_PROGRESS`, `RESOLVED`, `CANCELLED`
- **BR-09**: Every user email must be unique in the system (case-insensitive).
- **BR-10**: An Administrator is prohibited from deactivating their own currently logged-in account.
- **BR-11**: The system must prevent removing or deactivating the last active Administrator account.
- **BR-12**: Users cannot be deleted from the database; account access revocation must be performed via deactivation (`isActive = false`).
- **BR-13**: Comments and Internal Notes are append-only. Editing and deleting existing comments/notes is strictly prohibited. Empty or whitespace-only content is rejected.
- **BR-14**: Passwords must never be stored in plaintext. They must be hashed using bcrypt (cost factor >= 10) before storage.
- **BR-15**: Server-side authorization must be enforced on every protected endpoint. Returning 401 Unauthenticated for unauthenticated requests and 403 Forbidden for unauthorized requests.

---

## 6. UI Specification Summary
- **Theme & Design**: Reuses Zen Green design system (`#006B3C` primary, `#0B7A46` secondary, `#EAF6EF` light green, `#F5F7F6` background).
- **Application Shell**: Replaces Development Requester selector with User Profile badge, displaying current user's full name and role badge (Requester, IT Staff, Admin) with Logout action.
- **Role-based Navigation**:
  - Requester: "My Tickets", "Create Ticket"
  - IT Staff: "Ticket Queue", "My Assigned Tickets"
  - Administrator: "User Management"
- **Visual Distinction**: Public Comments use white cards with green borders; Internal Notes use distinct light-amber cards labeled "Internal Note (IT Staff Only)".

---

## 7. Data Changes
- **Data Models**:
  - `User`: `id`, `email` (unique), `passwordHash`, `name`, `role` (`REQUESTER`, `IT_STAFF`, `ADMIN`), `isActive`, `requiresPasswordChange`, `createdAt`, `updatedAt`.
  - `Ticket`: Adds `ownerId` (nullable FK to `User`), `itPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `requesterResolvedInd` (boolean).
  - `PublicComment`: `id`, `ticketId`, `authorId`, `content`, `createdAt`.
  - `InternalNote`: `id`, `ticketId`, `authorId`, `content`, `createdAt`.
- **Migration Strategy**: Transform Lab 2 `DevelopmentRequester` records into `User` records with `role = REQUESTER`, `requiresPasswordChange = false`, and initial default passwords. Link existing `Ticket.requesterId` to `User.id`.

---

## 8. API Contract Summary
- **Authentication**:
  - `POST /api/auth/login` - Authenticate user credentials.
  - `POST /api/auth/logout` - Destroy authenticated session.
  - `GET /api/auth/me` - Get current authenticated user details.
  - `POST /api/auth/change-password` - Mandatory first-login password change.
- **IT Staff Queue & Tickets**:
  - `GET /api/tickets/queue` - Retrieve ticket queue with search, filter, sort, pagination (IT Staff / Admin).
  - `PATCH /api/tickets/:id/claim` - Claim ownership of ticket.
  - `PATCH /api/tickets/:id/reassign` - Reassign ticket ownership.
  - `PATCH /api/tickets/:id/status` - Update ticket status.
  - `PATCH /api/tickets/:id/it-priority` - Update IT Priority.
  - `PATCH /api/tickets/:id/indicate-resolved` - Requester indicates problem appears resolved.
- **Comments & Notes**:
  - `GET /api/tickets/:id/comments` & `POST /api/tickets/:id/comments` - Public Comments.
  - `GET /api/tickets/:id/notes` & `POST /api/tickets/:id/notes` - Internal Notes (IT Staff / Admin).
- **Admin User Management**:
  - `GET /api/admin/users` - List users with search and role filter.
  - `POST /api/admin/users` - Create user.
  - `PATCH /api/admin/users/:id` - Update user details.
  - `POST /api/admin/users/:id/reset-password` - Issue new initial password.

---

## 9. Acceptance Criteria
- **AC-01**: Given an active user with valid credentials, when login succeeds, then the backend establishes authenticated access and returns user identity and role.
- **AC-02**: Given a user with `requiresPasswordChange = true`, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.
- **AC-03**: Given an authenticated Requester, when the client supplies another `requesterId`, then the backend applies the authenticated identity and does not return another user's data.
- **AC-04**: Given a Requester account, when requesting an Internal Note endpoint, then the request is rejected (403 Forbidden) without exposing note content.
- **AC-05**: Given an IT Staff user, when accessing the Ticket Queue, then they can search by keyword, filter by status/priority, and paginate through results.
- **AC-06**: Given an IT Staff user, when claiming an unassigned ticket, then the ticket `ownerId` updates to the IT Staff user ID and status updates to `OPEN` if it was `NEW`.
- **AC-07**: Given a Requester, when clicking "Problem Appears Resolved", then `requesterResolvedInd` becomes `true` and a Public Comment is posted without directly setting status to `RESOLVED` or `CLOSED`.
- **AC-08**: Given an Administrator, when viewing User Management, then all users are listed and searchable by name or email.
- **AC-09**: Given an Administrator, when creating a user with an existing email, then the system rejects the request with a duplicate email validation error (409 Conflict / 400 Bad Request).
- **AC-10**: Given an Administrator, when attempting to deactivate their own account, then the operation is rejected with an appropriate safety error.
- **AC-11**: Given the last active Administrator account, when attempting to deactivate or demote its role, then the system blocks the action.
- **AC-12**: Given an inactive user (`isActive = false`), when attempting login with correct password, then authentication fails with a safe error message ("Account is disabled").

---

## 10. Definition of Done
- Full implementation of all functional requirements and business rules.
- 100% passing automated test suite (Unit, API, UI, Authorization, E2E).
- Clean migration of Lab 2 data without data loss or corruption.
- Complete Zen Green UI implementation across Desktop, Tablet, and Mobile.
- Approved documentation (`specification.md`, `ui-spec.md`, `api-spec.md`, `tests.md`, `reviewer.md`, `ai-use.md`).
- GitHub workflow compliance (feature branches merged into `lab3-staging` and `main`).

---

## 11. Assumptions and Decisions
- **Session Strategy**: HTTP-Only signed cookies / JWT session token used for secure credential storage.
- **Email Delivery**: Initial password sending via email is explicitly excluded; initial passwords are generated and displayed to the Admin upon creation/reset for local development.
