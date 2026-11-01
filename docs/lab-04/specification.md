# Lab 4 Sprint Engineering Specification: Actions Taken, Dashboards, and Final Regression

## 1. Sprint Goal
Complete the core TokTickIT service-desk system by implementing the parent-child Actions Taken work tracking structure, enforcing authoritative ticket workflow state transitions and formal resolution gates, providing role-appropriate operational dashboards for Requesters and IT Staff, and hardening the full-stack system across all previous sprint increments under the Zen Green design system.

---

## 2. Stakeholder Request Interpretation
While TokTickIT currently allows ticket creation, queue management, and communication between Requesters and IT Staff, operational teams lack a structured method to plan, track, and audit actual technical work performed. 

Under each Ticket, the system must add an **Actions Taken** work-log entity. Each action entry must record the action date/time, action description, result, automated performer attribution, follow-up requirement indicator, conditional follow-up notes, and referenced attachment notes. The primary Ticket Owner remains responsible for coordinating the ticket overall, but different IT Staff members must be permitted to record actions taken. Requesters may continue to submit advisory feedback indicating a problem appears resolved, but only IT Staff or Administrators may formally transition the ticket to `Resolved`. 

Furthermore, concise and responsive **Dashboards** must be introduced for Requesters and IT Staff to summarize live operational data with direct drill-down links to filtered lists. The entire application must undergo final regression, security verification, and accessibility hardening.

---

## 3. Scope

### 3.1. Included
- **Actions Taken Work Structure**:
  - 1-to-Many parent-child relationship between `Ticket` and `ActionTaken`.
  - Recording Action Date/Time, Action Description, Result, Performed by (auto-populated with authenticated user), Follow-Up Required (boolean), Follow-up Note (mandatory if follow-up required), and Attachment Notes.
  - Role-based permissions: IT Staff and Administrators create and edit actions; Requesters have read-only access to actions on their owned tickets.
- **Ticket Workflow & Resolution Gates**:
  - Full lifecycle state machine: `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, and `Cancelled`.
  - Backend enforcement of resolution rules: Requester "Problem Appears Resolved" indication is strictly advisory and cannot directly set status to `Resolved` or `Closed`.
  - Formal resolution and closure restricted to IT Staff and Administrators.
  - Concurrency control / stale update detection using timestamp validation (`updatedAt`) to prevent accidental overwrites.
- **Role-Appropriate Dashboards**:
  - **IT Staff Dashboard**: Aggregated operational metrics (Unassigned tickets, My Assigned tickets, counts by Status and IT Priority) and My Recent Tickets list with drill-down links to filtered Ticket Queue views.
  - **Requester Dashboard**: Ownership-protected metrics (My Open tickets, Waiting for Requester, Recently Resolved, Closed) and My Recent Tickets list with quick action navigation.
  - **Admin Dashboard**: Reuses IT Staff dashboard capabilities with user-account summary metrics.
- **Final Hardening & Regression**:
  - Comprehensive automated testing across Unit, Integration/API, UI Component, and Playwright E2E suites.
  - Backward compatibility ensuring all Lab 1 (categories, health), Lab 2 (requesters, tickets, attachments), and Lab 3 (auth, queue, notes, comments, user management) features continue to function seamlessly.
  - Zen Green design consistency, responsive design (Desktop, Tablet, Mobile), accessibility (WCAG AA, keyboard navigation, focus cues), and zero console errors.

### 3.2. Explicitly Excluded (Per Lab 4 Handout Section 4.2)
- Automatic SLA clocks, escalation engines, on-call scheduling, and breach notifications.
- Email, SMS, LINE, push, or external notification services.
- Inventory consumption, spare-parts management, purchasing, or service cost accounting.
- Time-sheet billing, payroll, or labor-cost calculation engines.
- Multi-level approval workflows and electronic signatures.
- Advanced business-intelligence tools, custom report builders, or data warehouse export pipelines.
- Multi-tenant organizational partitioning and cloud-scale cluster operations.

---

## 4. Functional Requirements

- **FR-01 (Actions Taken Model)**: The system shall maintain an append-capable `ActionTaken` log under each Ticket, capturing action date/time, description, result, performer attribution, follow-up flag, follow-up note, and attachment notes.
- **FR-02 (Action Performer Attribution)**: The system shall automatically attribute the `performedBy` field to the currently authenticated IT Staff or Administrator user session upon action creation.
- **FR-03 (Action Conditional Validation)**: The system shall enforce that whenever `followUpRequired` is marked true, a non-empty `followUpNote` must be provided.
- **FR-04 (Action Role Access)**: The system shall allow IT Staff and Administrators to create and update Actions Taken records on any accessible Ticket. Requesters shall have read-only access strictly limited to their own tickets.
- **FR-05 (Collaborative Work Allocation)**: The system shall permit any active IT Staff member or Administrator to record Actions Taken on a ticket, regardless of whether that user is the assigned Ticket Owner.
- **FR-06 (Ticket Status Lifecycle)**: The system shall enforce the approved Ticket status state-transition matrix across `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, and `Cancelled`.
- **FR-07 (Resolution Gate Enforcement)**: The backend shall reject any client attempt by a Requester to set a Ticket to `Resolved` or `Closed`. A Requester's "Problem Appears Resolved" indication shall remain purely advisory.
- **FR-08 (Concurrency Conflict Handling)**: The system shall detect stale or concurrent ticket status and action modifications and return HTTP 409 Conflict to protect data integrity.
- **FR-09 (IT Staff Dashboard)**: The system shall provide an IT Staff Dashboard displaying live metric cards for New, Open, In Progress, Waiting for Requester, and My Assigned tickets, alongside recent urgent tickets and drill-down links.
- **FR-10 (Requester Dashboard)**: The system shall provide a Requester Dashboard summarizing total open tickets, tickets waiting on the requester, recently updated tickets, and resolved tickets, strictly scoped to the authenticated user.
- **FR-11 (Admin Dashboard Support)**: The system shall allow Administrators to access the IT Staff dashboard operational views and account management metrics.
- **FR-12 (Full Sprint Regression)**: The system shall preserve all previously built functionality from Labs 1, 2, and 3 without degradation or broken contracts.

---

## 5. Business Rules

- **BR-01**: An Action Taken belongs to exactly one Ticket (`ticketId` is required and immutable).
- **BR-02**: The primary Ticket Owner coordinates the ticket as a whole, but an Action Taken may be recorded and performed by any active IT Staff or Administrator user.
- **BR-03**: The `performedBy` identity is authoritative and must be extracted from the authenticated session, preventing spoofing of performer identity.
- **BR-04**: If `followUpRequired` is `true`, `followUpNote` cannot be empty or contain only whitespace. If `followUpRequired` is `false`, `followUpNote` is optional or null.
- **BR-05**: Requesters are strictly prohibited from creating, updating, or deleting Actions Taken (HTTP 403 Forbidden).
- **BR-06**: Requesters may only view Actions Taken for tickets where `ticket.requesterId == authenticatedUser.id`. Access to Actions Taken on other users' tickets is rejected with HTTP 403 Forbidden without info leakage.
- **BR-07**: Permitted Ticket Status Transitions:
  | From Status | Permitted To Statuses | Authorized Roles |
  |---|---|---|
  | `NEW` | `OPEN`, `IN_PROGRESS`, `CANCELLED` | IT Staff, Admin |
  | `OPEN` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin |
  | `IN_PROGRESS` | `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin |
  | `WAITING_FOR_REQUESTER` | `IN_PROGRESS`, `RESOLVED`, `CANCELLED` | IT Staff, Admin |
  | `RESOLVED` | `CLOSED`, `REOPENED` | IT Staff, Admin |
  | `CLOSED` | `REOPENED` | IT Staff, Admin |
  | `REOPENED` | `IN_PROGRESS`, `WAITING_FOR_REQUESTER`, `RESOLVED`, `CANCELLED` | IT Staff, Admin |
  | Any Status | `CANCELLED` | IT Staff, Admin (or Requester if ticket is still `NEW`) |
- **BR-08 (Resolution Gate)**: Only IT Staff and Administrators may transition a ticket to `RESOLVED` or `CLOSED`. Any direct client call by a Requester attempting this transition must be rejected with HTTP 403 Forbidden by the server.
- **BR-09 (Requester Advisory Rule)**: When a Requester triggers "Problem Appears Resolved", the client may optionally supply a resolution note (`{ note?: string }`). The backend updates `requesterResolvedInd = true` and appends an automated Public Comment (incorporating the note if provided), but the ticket status remains in its current state (e.g. `IN_PROGRESS` or `WAITING_FOR_REQUESTER`) until formally verified by IT Staff.
- **BR-10 (Optimistic Concurrency Control)**: All Ticket and Action Taken updates must validate the client's cached timestamp or version. If the server record has a newer `updatedAt`, the backend rejects the write with HTTP 409 Conflict.
- **BR-11 (Dashboard Authoritative Calculation)**: All dashboard metrics must be computed dynamically by backend database aggregations and not by client-side array filtering of raw collections.
- **BR-12 (Requester Dashboard Isolation)**: All Requester dashboard queries must automatically bind `WHERE requesterId = currentUser.id`. No query parameter can override this scope.
- **BR-13 (Zero-Value Metrics Integrity)**: Dashboard metric cards must return numeric `0` and render `0` gracefully when no matching records exist, avoiding `null`, `undefined`, or broken layouts.
- **BR-14 (Inactive Assignee Safety)**: Reassigning a ticket or attributing an Action Taken to a deactivated user (`isActive = false`) is rejected with HTTP 400 Bad Request.
- **BR-15 (Audit Trail Stability)**: Actions Taken records maintain immutable creation timestamps and ordered sequencing by `actionDateTime ASC, id ASC`.
- **BR-16 (Immutable Audit Trail & Omission of Deletion)**: Actions Taken records are strictly permanent work logs; the system intentionally provides no `DELETE` endpoint. Once created, action records cannot be removed by any role (including Administrators) to preserve a reliable, tamper-evident audit history of technical interventions.

---

## 6. UI Specification Summary
*(Refer to `docs/lab-04/ui-spec.md` for complete mockups, styles, and responsive tokens)*
- **Theme**: Zen Green design system (`#006B3C` primary, `#0B7A46` secondary, `#EAF6EF` soft surface, `#FFFFFF` cards, `#F5F7F6` body canvas).
- **Navigation Shell**: Role-aware navbar:
  - Requester: "Dashboard" | "My Tickets" | "Create Ticket" | User Profile Menu.
  - IT Staff & Admin: "Dashboard" | "Ticket Queue" | "User Management" (Admin) | User Profile Menu.
- **IT Staff Dashboard Screen**:
  - Top: Operational welcome banner with quick refresh button.
  - Metric Row: 5 responsive stat cards (New, Open, In Progress, Waiting for Requester, My Assigned). Each card includes accessible hover states and click-through drill-down to filtered Ticket Queue.
  - Main Area: 2-column layout on desktop: Left column contains "My Recent Tickets" list with status badges and timestamps; Right column contains "Quick Actions" (Create Ticket, Search, My Queue).
- **Requester Dashboard Screen**:
  - Metric Row: 4 stat cards (My Open Tickets, In Progress, Resolved, Closed).
  - Main Area: Recent tickets table with drill-down to Requester Ticket Detail and quick ticket submission buttons.
- **Actions Taken UI (on Ticket Detail)**:
  - Clean card section placed below ticket info and alongside comments/notes.
  - Interactive table/timeline showing Action Date/Time, Description, Result, Performed By badge, Follow-Up pill, and Attachment Notes.
  - "Add Action Taken" modal button (IT Staff/Admin).
  - Modal form with inline field validation for Follow-Up Note requirement.
  - Read-only table view for Requesters with create/edit controls completely removed.

---

## 7. Data Changes & Justifications

### 7.1. Prisma Schema Increment
```prisma
model ActionTaken {
  id               Int      @id @default(autoincrement())
  ticketId         Int
  ticket           Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  actionDateTime   DateTime @default(now())
  description      String   @db.Text
  result           String   @db.Text
  performedById    Int
  performedBy      User     @relation("ActionsPerformed", fields: [performedById], references: [id])
  followUpRequired Boolean  @default(false)
  followUpNote     String?  @db.Text
  attachmentNotes  String?  @db.Text
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([ticketId, actionDateTime(sort: Desc)])
  @@index([performedById])
}
```

### 7.2. Database Design Decisions & Justifications
1. **Decision 1: Separate `performedById` Foreign Key from `Ticket.ownerId`**:
   - *Justification*: In realistic IT service-desk environments, complex tickets require collaboration across multiple specialists (e.g. network engineers, hardware technicians) while a single Ticket Owner retains coordination accountability. Coupling action logging to the ticket owner would prevent collaborative logging or force artificial reassignments.
2. **Decision 2: Compound Indexing on `[ticketId, actionDateTime]` & Dedicated Performer Index**:
   - *Justification*: Dashboard calculations and ticket detail views frequently query actions ordered by chronological execution per ticket (`WHERE ticketId = ? ORDER BY actionDateTime ASC`). The performer index enables instant aggregation of work done by specific staff members without full table scans.
3. **Decision 3: Use of Optimistic Concurrency Timestamp (`updatedAt`) on Tickets**:
   - *Justification*: To satisfy BR-10 and prevent conflicting updates when multiple staff members or a staff member and requester interact with the same ticket simultaneously, comparing `updatedAt` guarantees safe failure with HTTP 409 Conflict rather than silent data overwrites.

### 7.3. Migration and Backfill Strategy
- All existing records in `Ticket`, `User`, `Attachment`, `PublicComment`, and `InternalNote` are preserved.
- Legacy tickets created in Labs 1-3 without actions will naturally have zero `ActionTaken` child rows. The UI and API gracefully handle zero-count arrays with standard empty state cards.
- Database seed is idempotent and populates realistic tickets covering 0, 1, and multiple Actions Taken, ensuring comprehensive test coverage.

---

## 8. API Contract Summary
*(Refer to `docs/lab-04/api-spec.md` for exact JSON schemas)*
- **Actions Taken**:
  - `POST /api/tickets/:id/actions-taken`: Create an action record (IT Staff, Admin).
  - `GET /api/tickets/:id/actions-taken`: Fetch actions for a ticket (Owner Requester, IT Staff, Admin).
  - `PATCH /api/tickets/:id/actions-taken/:actionId`: Update an action entry (IT Staff, Admin).
  - `GET /api/tickets/:id/actions-taken/:actionId`: Retrieve single action details.
- **Dashboards**:
  - `GET /api/dashboards/staff`: Authoritative IT Staff operational metrics and recent urgent tickets.
  - `GET /api/dashboards/requester`: Authenticated requester's ticket summary metrics and recent activity.
- **Workflow & Lifecycle**:
  - `PATCH /api/tickets/:id/status`: Transition ticket status with state-machine and concurrency checks.
  - `PATCH /api/tickets/:id/indicate-resolved`: Advisory requester indication (appends comment, flags advisory boolean).

---

## 9. Acceptance Criteria

- **AC-01 (Create Action Taken)**: Given an authenticated IT Staff user and valid action payload, when `POST /api/tickets/:id/actions-taken` is executed, then the action is persisted under the specified ticket with `performedById` automatically assigned to the authenticated user.
- **AC-02 (Follow-Up Note Validation)**: Given an IT Staff user submitting an action with `followUpRequired = true` and an empty `followUpNote`, when submitted, then the backend rejects the request with HTTP 400 Bad Request and an explicit validation message.
- **AC-03 (Requester Action Creation Blocked)**: Given an authenticated Requester, when attempting to `POST` or `PATCH` an Action Taken, then the request is rejected with HTTP 403 Forbidden.
- **AC-04 (Requester Action View Ownership)**: Given an authenticated Requester, when requesting `GET /api/tickets/:id/actions-taken` for a ticket owned by another user, then the system returns HTTP 403 Forbidden.
- **AC-05 (Collaborative Action Performer)**: Given a ticket owned by IT Staff User A, when IT Staff User B logs an Action Taken, then the action is saved successfully with User B as performer, leaving User A as ticket owner.
- **AC-06 (Formal Resolution Gate)**: Given a Requester attempting `PATCH /api/tickets/:id/status` with status `RESOLVED`, then the server rejects the request with HTTP 403 Forbidden.
- **AC-07 (Advisory Resolution Flag)**: Given an authenticated Requester marking problem as resolved, when triggered, then `requesterResolvedInd` becomes `true` and a public comment is created, but the ticket status remains unchanged.
- **AC-08 (Valid Status Transition)**: Given an IT Staff user, when moving a ticket from `OPEN` to `IN_PROGRESS` or `RESOLVED`, then the status updates successfully and persists.
- **AC-09 (Illegal Status Transition)**: Given an IT Staff user attempting an invalid transition (e.g. `NEW` directly to `RESOLVED` or `CLOSED` to `RESOLVED`), then the server rejects with HTTP 400 Bad Request.
- **AC-10 (Optimistic Concurrency Detection)**: Given a stale ticket update request with mismatched `updatedAt`, then the server returns HTTP 409 Conflict.
- **AC-11 (IT Staff Dashboard Aggregation)**: Given an IT Staff user, when fetching `GET /api/dashboards/staff`, then accurate counts for unassigned tickets, tickets assigned to current user, and status breakdowns are returned matching database records.
- **AC-12 (Requester Dashboard Isolation)**: Given an authenticated Requester, when fetching `GET /api/dashboards/requester`, then returned metrics and recent tickets contain only data belonging to that requester.
- **AC-13 (Zero-Value Metrics Handling)**: Given a user with zero tickets in a particular status, then the dashboard returns numeric `0` and the UI displays `0` with an appropriate empty-state message.
- **AC-14 (Drill-Down Navigation)**: Given a user on the IT Staff Dashboard, when clicking the "In Progress" card, then the browser navigates to the Ticket Queue pre-filtered by `status=IN_PROGRESS`.

---

## 10. Definition of Done (DoD)
- [ ] All Functional Requirements (FR-01 to FR-12) and Business Rules (BR-01 to BR-16) implemented.
- [ ] Prisma schema migration and idempotent seed verified with zero, one, and multi-action tickets.
- [ ] 100% automated test pass rate for all unit, API integration, UI component, and Playwright E2E suites.
- [ ] Server-side authorization and resolution gate verified via automated negative tests.
- [ ] Zen Green UI compliant, responsive across desktop/tablet/mobile, and free of accessibility errors.
- [ ] Full regression confirmed for Labs 1, 2, and 3 capabilities.
- [ ] Complete documentation delivered under `docs/lab-04/` and approved via peer review.
- [ ] Staged Git workflow followed: feature branches merged into `lab4-staging`, then released to `main`.
