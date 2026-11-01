import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import { TicketStatus } from "@prisma/client";

describe("Lab 4 Ticket Workflow & Resolution Gate API", () => {
  let itStaffToken: string;
  let requesterToken: string;
  let inProgressTicketId: number;
  let openTicketId: number;
  let newTicketId: number;
  let closedTicketId: number;

  beforeAll(async () => {
    // 1. Login as IT Staff (Kevin Patel)
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "kevin.patel@toktickit.com", password: "Password123!" });
    itStaffToken = staffLogin.body.token;

    // 2. Login as Requester (Jennifer Anderson)
    const reqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;

    // Fetch ticket IDs
    const ticketInProgress = await getPrisma().ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001234" },
    });
    inProgressTicketId = ticketInProgress!.id;

    const ticketOpen = await getPrisma().ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001233" },
    });
    openTicketId = ticketOpen!.id;

    const ticketNew = await getPrisma().ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001231" },
    });
    newTicketId = ticketNew!.id;

    const ticketClosed = await getPrisma().ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001229" },
    });
    closedTicketId = ticketClosed!.id;
  });

  beforeEach(async () => {
    // Reset test ticket statuses to ensure idempotent test runs
    await getPrisma().ticket.update({
      where: { id: inProgressTicketId },
      data: { status: TicketStatus.IN_PROGRESS, requesterResolvedInd: false },
    });
    await getPrisma().ticket.update({
      where: { id: openTicketId },
      data: { status: TicketStatus.OPEN },
    });
    await getPrisma().ticket.update({
      where: { id: newTicketId },
      data: { status: TicketStatus.NEW },
    });
    await getPrisma().ticket.update({
      where: { id: closedTicketId },
      data: { status: TicketStatus.CLOSED },
    });
  });

  it("API-11: Requester cannot transition ticket to RESOLVED (Resolution Gate HTTP 403) (AC-06, BR-08)", async () => {
    // Requester (Jennifer Anderson) attempting to bypass resolution gate
    const res = await request(app)
      .patch(`/api/tickets/${inProgressTicketId}/status`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ status: "RESOLVED" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/resolution gate|forbidden/i);

    // Verify ticket status was NOT changed in DB
    const ticket = await getPrisma().ticket.findUnique({ where: { id: inProgressTicketId } });
    expect(ticket!.status).toBe(TicketStatus.IN_PROGRESS);
  });

  it("API-12: Requester indicate-resolved sets requesterResolvedInd=true and creates Public Comment (AC-07, BR-09)", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${inProgressTicketId}/indicate-resolved`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({ note: "Battery replacement confirmed working by user." });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requesterResolvedInd).toBe(true);

    // Ticket status remains IN_PROGRESS (not RESOLVED)
    expect(res.body.data.status).toBe(TicketStatus.IN_PROGRESS);

    // Verify automated comment was created with note
    const comments = await getPrisma().publicComment.findMany({
      where: { ticketId: inProgressTicketId },
      orderBy: { createdAt: "desc" },
    });
    expect(comments.length).toBeGreaterThan(0);
    expect(comments[0].content).toContain("Battery replacement confirmed working by user.");
  });

  it("API-13: IT Staff transitions ticket through valid lifecycle (OPEN -> IN_PROGRESS -> RESOLVED) (AC-08, BR-07)", async () => {
    // 1. Transition OPEN -> IN_PROGRESS
    const res1 = await request(app)
      .patch(`/api/tickets/${openTicketId}/status`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({ status: "IN_PROGRESS" });

    expect(res1.status).toBe(200);
    expect(res1.body.data.status).toBe("IN_PROGRESS");

    // 2. Transition IN_PROGRESS -> RESOLVED
    const res2 = await request(app)
      .patch(`/api/tickets/${openTicketId}/status`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({ status: "RESOLVED" });

    expect(res2.status).toBe(200);
    expect(res2.body.data.status).toBe("RESOLVED");
  });

  it("API-14: Rejects invalid or out-of-order status transitions with HTTP 400 Bad Request (AC-09, BR-07)", async () => {
    // 1. Attempt invalid transition: NEW directly to RESOLVED
    const res1 = await request(app)
      .patch(`/api/tickets/${newTicketId}/status`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({ status: "RESOLVED" });

    expect(res1.status).toBe(400);
    expect(res1.body.error).toMatch(/cannot transition status/i);

    // 2. Attempt invalid transition: CLOSED directly to OPEN
    const res2 = await request(app)
      .patch(`/api/tickets/${closedTicketId}/status`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({ status: "OPEN" });

    expect(res2.status).toBe(400);
    expect(res2.body.error).toMatch(/cannot transition status/i);
  });

  it("API-15: Concurrency conflict returns HTTP 409 Conflict when lastUpdatedAt is stale (AC-10, BR-10)", async () => {
    const staleTimestamp = "2020-01-01T00:00:00.000Z";

    const res = await request(app)
      .patch(`/api/tickets/${inProgressTicketId}/status`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        status: "RESOLVED",
        lastUpdatedAt: staleTimestamp,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/conflict|modified by another user/i);
  });

  it("API-16: Rejects ticket assignment to inactive user with HTTP 400 Bad Request (BR-14)", async () => {
    const inactiveStaff = await getPrisma().user.findUnique({
      where: { email: "inactive.staff@toktickit.com" },
    });
    expect(inactiveStaff).toBeDefined();

    const res = await request(app)
      .patch(`/api/tickets/${inProgressTicketId}/reassign`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({ ownerId: inactiveStaff!.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/active IT Staff or Administrator/i);
  });
});
