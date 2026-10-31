import { describe, it } from "vitest";

describe("Lab 4 Ticket Workflow & Resolution Gate API (TDD Scaffolding)", () => {
  it.todo("API-11: Requester cannot transition ticket to RESOLVED (Resolution Gate HTTP 403) (AC-06, BR-08)");
  it.todo("API-12: Requester indicate-resolved sets requesterResolvedInd=true and creates Public Comment (AC-07, BR-09)");
  it.todo("API-13: IT Staff transitions ticket through valid lifecycle (OPEN -> IN_PROGRESS -> RESOLVED) (AC-08, BR-07)");
  it.todo("API-14: Rejects invalid or out-of-order status transitions with HTTP 400 Bad Request (AC-09, BR-07)");
  it.todo("API-15: Concurrency conflict returns HTTP 409 Conflict when lastUpdatedAt is stale (AC-10, BR-10)");
  it.todo("API-16: Rejects ticket assignment to inactive user with HTTP 400 Bad Request (BR-14)");
});
