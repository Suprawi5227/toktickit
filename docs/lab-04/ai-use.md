# Lab 4 AI Use and Reflection

## LLM Model Used
- **Model**: Gemini 3.8 Flash / Gemini 4 Argon (Antigravity AI Coding Assistant)

---

## Key Prompts Used (10 Prompts)

1. **Sprint 4 Engineering Specification & Contract Generation (Spec DD)**:
   > *"Draft `docs/lab-04/specification.md`, `ui-spec.md`, and `api-spec.md` covering Sprint 4 Goal, Stakeholder Request, Functional Requirements (FR-01..FR-12), Business Rules (BR-01..BR-16), Ticket State Machine (NEW, OPEN, IN_PROGRESS, WAITING_FOR_REQUESTER, RESOLVED, CLOSED, REOPENED, CANCELLED), Optimistic Concurrency Control (HTTP 409), Resolution Gate, and Role Dashboards."*

2. **Test-Driven Development (TDD) Plan & Traceability Matrix**:
   > *"Create `docs/lab-04/tests.md` and scaffold 47 automated test cases across Unit (`UNIT-01`..`02`), API (`API-01`..`22`), UI (`UI-01`..`14`), E2E (`E2E-01`..`06`), and Sprint Regression (`REG-01`..`03`) mapped 1:1 to Acceptance Criteria AC-01 through AC-14."*

3. **Prisma Schema Evolution & Idempotent Seed**:
   > *"Evolve `server/prisma/schema.prisma` to add the `ActionTaken` model with `performedById` decoupled from `Ticket.ownerId`, compound index `@@index([ticketId, actionDateTime(sort: Desc)])`, and update `server/prisma/seed.ts` with idempotent multi-performer Actions Taken, advisory resolution flags, and all 4 IT priority levels."*

4. **Actions Taken REST API & Authorization Gate**:
   > *"Implement `server/src/routes/actions-taken.routes.ts` supporting `POST /`, `GET /`, `GET /:actionId`, and `PATCH /:actionId` with conditional `followUpNote` validation (BR-04), inactive user safety checks (BR-14), optimistic concurrency control (BR-10), Requester ownership isolation (BR-06), and omission of `DELETE` for immutable audit trails (BR-16)."*

5. **Ticket Workflow State Machine & Resolution Gate**:
   > *"Enhance `server/src/routes/staff.routes.ts` to enforce the `PERMITTED_TRANSITIONS` matrix (BR-07), block Requesters from transitioning tickets to `RESOLVED` or `CLOSED` with HTTP 403 (BR-08), support Requester advisory resolution `PATCH /:id/indicate-resolved` (BR-09), and validate `lastUpdatedAt` timestamps to return HTTP 409 Conflict on concurrent edits (BR-10)."*

6. **Authoritative Role Dashboards Backend API**:
   > *"Create `server/src/routes/dashboard.routes.ts` implementing `GET /api/dashboards/staff` (live counts, priority breakdown, recent tickets, and conditional Admin `userSummary` per FR-11) and `GET /api/dashboards/requester` (strictly isolated to `requesterId = req.user.id` per BR-12 with zero-count safety per BR-13)."*

7. **Actions Taken Frontend UI & Modal Validation**:
   > *"Build `client/src/components/ActionsTaken.tsx` displaying chronological work logs, performer attribution badges, follow-up indicators, and a modal form for IT Staff/Admin with client-side validation requiring `followUpNote` when `followUpRequired` is checked, while rendering a clean read-only timeline for Requesters."*

8. **Role Dashboards UI & Interactive Queue Drill-Down**:
   > *"Implement `StaffDashboard.tsx` and `RequesterDashboard.tsx` under the Zen Green theme with keyboard-accessible (`Enter`/`Space`) metric cards that drill down into `StaffTicketQueue.tsx` with preset filter parameters, plus an Admin System User Summary section."*

9. **Ticket Workflow UI Controls, Advisory Banner & Concurrency Alert**:
   > *"Update `StaffTicketDetail.tsx` and `TicketDetail.tsx` to filter status selector options by `PERMITTED_TRANSITIONS`, render the Teal `#20C997` badge for `REOPENED` tickets, display the Requester 'Problem Appears Resolved' button and IT Staff Advisory Banner with 'Formally Resolve Ticket' shortcut, and surface an HTTP 409 Conflict refresh alert."*

10. **Playwright E2E System Workflows & Full Regression Hardening**:
    > *"Implement Playwright E2E specs (`actions-taken-flow.spec.ts`, `ticket-resolution.spec.ts`, `dashboards.spec.ts`) with in-process test server setup and verify all 48 Server tests, 25 Client tests, and 6 E2E tests pass with zero regression across Labs 1–4."*

---

## Reflection on AI Specification, TDD, and Peer Review Workflow

1. **Spec-First Precision (Spec DD)**:
   Defining the exact state transition matrix (`BR-07`), optimistic concurrency payload (`lastUpdatedAt` -> `HTTP 409`), and separate performer attribution (`performedById` vs `ownerId`) in `specification.md` and `api-spec.md` before writing code prevented architectural drift between the Express routes and React components.
2. **Test-Driven Confidence (TDD)**:
   Scaffolding all 47 test cases (`UNIT`, `API`, `UI`, `E2E`, `REG`) upfront provided an executable checklist. When implementing route mounting in `app.ts` and transaction cleanup in `seed.test.ts`, the regression suite immediately caught route shadowing and foreign-key ordering issues before they could reach production.
3. **Human Peer Review Synergy**:
   Iterative peer reviews on GitHub PRs caught subtle contract mismatches—such as aligning `performedBy` vs `performer` field names in `ActionsTaken.tsx`, guarding the `"Formally Resolve Ticket"` shortcut against `NEW`/`CANCELLED` states via `PERMITTED_TRANSITIONS`, and handling `window.prompt` cancellation (`null`) in `TicketDetail.tsx`. Combining AI generation with human peer review produced a much higher-quality, production-ready system.
