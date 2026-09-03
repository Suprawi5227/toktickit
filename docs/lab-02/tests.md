# Lab 2 Test Plan and Results

## 1. Test Strategy
We will apply Test-Driven Development (TDD) by planning out Unit, API, UI Component, and End-to-End (E2E) tests. Tests will verify happy paths, validation failures, cross-requester ownership boundaries, and empty/error states.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-01 | API | AC-01 | Create valid ticket | 201; one saved Ticket; unique number returned | `server/tests/lab-02/tickets.api.test.ts` | TBD |
| API-02 | API | AC-05 | Create ticket missing summary | 400 Bad Request; validation error returned | `server/tests/lab-02/tickets.api.test.ts` | TBD |
| API-03 | API | AC-03 | Access Ticket of another Requester | 403 Forbidden or 404 Not Found | `server/tests/lab-02/ticket-detail.api.test.ts` | TBD |
| API-04 | API | AC-04 | Upload file > 5MB | 400 Bad Request; upload rejected | `server/tests/lab-02/attachments.api.test.ts` | TBD |
| UI-01 | UI | BR-09 | Development Requester selector | Shows only active Requesters | `client/.../lab-02/RequesterSelector.test.tsx` | TBD |
| UI-02 | UI | BR-10 | Submit button while loading | Displays busy state; button is disabled | `client/.../lab-02/CreateTicket.test.tsx` | TBD |
| UI-03 | UI | AC-05 | Submit without Summary | Field validation message appears; API not called | `client/.../lab-02/CreateTicket.test.tsx` | TBD |
| UI-04 | UI | AC-06 | Search filter with no matches | Shows empty state component instead of table | `client/.../lab-02/MyTickets.test.tsx` | TBD |
| UI-05 | UI | AC-07 | Changing active Requester | Reloads My Tickets list for the new Requester | `client/.../lab-02/MyTickets.test.tsx` | TBD |
| E2E-01 | E2E | AC-01, AC-02 | Complete ticket submission flow | Official number shown on success confirmation | `e2e/lab-02/requester-ticket-flow.spec.ts` | TBD |

## 3. Acceptance-Criterion Traceability

| AC ID | Covered by Tests |
|---|---|
| AC-01 | API-01, E2E-01 |
| AC-02 | E2E-01 |
| AC-03 | API-03 |
| AC-04 | API-04 |
| AC-05 | API-02, UI-03 |
| AC-06 | UI-04 |
| AC-07 | UI-05 |
| AC-08 | (To be added in next phase) |

## 4. Responsive and Visual Checklist
- [ ] Multi-column layout applied on Desktop (≥ 992 px).
- [ ] Forms stack vertically on Mobile (< 768 px).
- [ ] No clipped labels or overlapping messages on any viewport.
- [ ] Button hierarchy (Primary, Secondary, Destructive) is visually distinct.
- [ ] "Zen Green" color palette applied correctly according to `ui-spec.md`.

## 5. Test Commands
*(Commands to run the tests will be added here once implementation is complete)*
- Unit/API: `npm run test:server`
- UI: `npm run test:client`
- E2E: `npx playwright test`

## 6. Final Results
*(To be filled upon implementation)*

## 7. Known Limitations or Deferred Tests
- Authentication security is deferred to Lab 3.
