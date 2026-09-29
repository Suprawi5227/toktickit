# Lab 3 Code Review & PR Approval Record

## Reviewer Information
- **Reviewer Name**: Peer Reviewer (Student Peer Review)
- **Target Branch**: `main` (staged via `lab3-staging`)
- **Review Date**: September 17, 2026

---

## PR Summary & Audit Findings

### 1. Specification & Architecture Conformance
- `docs/lab-03/specification.md`, `ui-spec.md`, `api-spec.md`, and `tests.md` correctly establish Spec DD and Test DD requirements prior to coding.
- Data models updated in Prisma schema for `User`, `Role`, `ITPriority`, `PublicComment`, `InternalNote`, and `Ticket` relationships.
- Idempotent seed data successfully generated with bcrypt password hashes.

### 2. Security & Authorization
- **Authentication**: JWT token / HTTP-Only cookies implemented securely. Passwords hashed using bcrypt (cost factor 10).
- **Mandatory Password Change**: `requiresPasswordChange` enforced on first login.
- **Server-side Authorization**: `requireRole` middleware and ownership checks prevent unauthorized access. Direct access to unowned tickets or internal notes rejected with 403 Forbidden without info leakage.
- **Administrator Safety Rules**:
  - Self-deactivation blocked with 400 error.
  - Deactivation/demotion of last active Administrator blocked with 400 error.

### 3. Peer Review Comments & Responses

#### PR #5 Review Feedback:
- **Comment from Peer Reviewer**: *"In `server/tests/lab-03/authorization.api.test.ts`, accessing `queueRes.body.data[0]` directly could fail with a TypeError if the dataset or search query returns empty. Recommended using optional chaining (`queueRes.body.data?.[0]`) for defensive test safety."*
- **Author Response & Resolution**: *"Agreed! Added optional chaining (`queueRes.body.data?.[0]`) and explicit `expect(targetTicket).toBeDefined()` assertion. Verified all vitest tests pass cleanly."*

---

## Approval Sign-off
- [x] All Acceptance Criteria (AC-01 through AC-12) satisfied.
- [x] All Business Rules (BR-01 through BR-15) enforced.
- [x] Tests passing with clean results.
- **Decision**: APPROVED for merge to `main`.
