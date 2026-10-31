import { describe, it } from "vitest";

describe("Lab 4 Ticket Workflow & Resolution Gate API (TDD Scaffolding)", () => {
  it.todo("API-10: Requester cannot transition ticket to RESOLVED (Resolution Gate HTTP 403) (AC-06)");
  it.todo("API-11: Requester indicate-resolved sets requesterResolvedInd=true and creates Public Comment (AC-07)");
  it.todo("API-12: IT Staff transitions ticket through valid lifecycle (OPEN -> IN_PROGRESS -> RESOLVED) (AC-08)");
  it.todo("API-13: Rejects invalid or out-of-order status transitions with HTTP 400 Bad Request (AC-09)");
  it.todo("API-14: Concurrency conflict returns HTTP 409 Conflict when lastUpdatedAt is stale (AC-10)");
});
