import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 4 Actions Taken API", () => {
  let itStaffToken: string;
  let itStaffBToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;
  let testTicketId: number;
  let createdActionId: number;
  let actionUpdatedAt: string;

  beforeAll(async () => {
    // 1. Login as primary IT Staff (Kevin Patel)
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "kevin.patel@toktickit.com", password: "Password123!" });
    itStaffToken = staffLogin.body.token;

    // 2. Login as secondary IT Staff (Robert Wilson)
    const staffBLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "robert.wilson@toktickit.com", password: "Password123!" });
    itStaffBToken = staffBLogin.body.token;

    // 3. Login as Requester A (Jennifer Anderson)
    const reqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;

    // 4. Login as Requester B (Michael Brown)
    const otherReqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael.brown@example.com", password: "Password123!" });
    otherRequesterToken = otherReqLogin.body.token;

    // Fetch ticket ID from database
    const ticketA = await getPrisma().ticket.findUnique({
      where: { ticketNumber: "TXT-2025-001234" },
    });
    testTicketId = ticketA!.id;
  });

  it("API-01: IT Staff creates Action Taken with automated performer attribution (AC-01, FR-01, FR-02)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        description: "Replaced faulty CMOS battery and reset UEFI settings.",
        result: "System retains time and boots to OS smoothly.",
        followUpRequired: false,
        attachmentNotes: "Hardware log attached.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.description).toBe("Replaced faulty CMOS battery and reset UEFI settings.");
    expect(res.body.data.performedBy).toBeDefined();
    expect(res.body.data.performedBy.email).toBe("kevin.patel@toktickit.com");
    expect(res.body.data.performedBy.role).toBe("IT_STAFF");
    expect(res.body.data.followUpRequired).toBe(false);
    expect(res.body.data.updatedAt).toBeDefined();

    createdActionId = res.body.data.id;
    actionUpdatedAt = res.body.data.updatedAt;
  });

  it("API-02: Rejects Action Taken when followUpRequired is true and followUpNote is empty (AC-02, FR-03, BR-04)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        description: "Cleaned dusty fan vents and reapplied thermal paste.",
        result: "Temperatures dropped by 15C under sustained test.",
        followUpRequired: true,
        followUpNote: "   ", // whitespace only
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/follow-up note is mandatory/i);
  });

  it("API-03: Rejects Requester attempting to create Action Taken with HTTP 403 Forbidden (AC-03, FR-04, BR-05)", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${requesterToken}`)
      .send({
        description: "Attempted to log personal diagnostic step.",
        result: "Not allowed.",
        followUpRequired: false,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it("API-04: Rejects Requester fetching Actions Taken for an unowned ticket with HTTP 403 (AC-04, BR-06)", async () => {
    // Michael Brown attempting to fetch actions for Jennifer Anderson's ticket
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${otherRequesterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });

  it("API-05: Allows Requester to fetch Actions Taken for their own ticket in read-only mode (AC-04, FR-04)", async () => {
    // Jennifer Anderson fetching actions for her own ticket
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].performedBy).toBeDefined();
    expect(res.body.data[0].updatedAt).toBeDefined();
  });

  it("API-06: Collaborative work - IT Staff B records action on ticket owned by Staff A (AC-05, FR-05, BR-02)", async () => {
    // Ticket A is owned by Kevin Patel. Robert Wilson (Staff B) records an action.
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${itStaffBToken}`)
      .send({
        description: "Assisted with secondary memory diagnostic and memtest86 scan.",
        result: "Zero memory errors across 4 complete passes.",
        followUpRequired: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.performedBy.email).toBe("robert.wilson@toktickit.com");

    // Verify ticket owner remains Kevin Patel
    const ticket = await getPrisma().ticket.findUnique({
      where: { id: testTicketId },
      include: { owner: true },
    });
    expect(ticket!.owner?.email).toBe("kevin.patel@toktickit.com");
  });

  it("API-07: Updates Action Taken with optimistic concurrency timestamp check (BR-10, Section 1.3)", async () => {
    // 1. Stale update with mismatched lastUpdatedAt
    const staleRes = await request(app)
      .patch(`/api/tickets/${testTicketId}/actions-taken/${createdActionId}`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        description: "Updated description attempt.",
        lastUpdatedAt: "2020-01-01T00:00:00.000Z", // Stale timestamp
      });

    expect(staleRes.status).toBe(409);
    expect(staleRes.body.error).toMatch(/conflict/i);

    // 2. Successful update with valid lastUpdatedAt
    const validRes = await request(app)
      .patch(`/api/tickets/${testTicketId}/actions-taken/${createdActionId}`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        result: "Updated result after prolonged 48h soak test.",
        lastUpdatedAt: actionUpdatedAt,
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.result).toBe("Updated result after prolonged 48h soak test.");
  });

  it("API-08: Retrieves single Action Taken by ID (Section 1.4)", async () => {
    const res = await request(app)
      .get(`/api/tickets/${testTicketId}/actions-taken/${createdActionId}`)
      .set("Authorization", `Bearer ${itStaffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdActionId);
    expect(res.body.data.performedBy).toBeDefined();
    expect(res.body.data.updatedAt).toBeDefined();
  });

  it("API-09: Rejects DELETE on Action Taken to maintain immutable audit trail (BR-16)", async () => {
    const res = await request(app)
      .delete(`/api/tickets/${testTicketId}/actions-taken/${createdActionId}`)
      .set("Authorization", `Bearer ${itStaffToken}`);

    // Expect 405 Method Not Allowed (or 404) preserving immutability
    expect([404, 405]).toContain(res.status);
    if (res.status === 405) {
      expect(res.body.error).toMatch(/immutable audit trail/i);
    }
  });

  it("API-10: Rejects Action Taken attribution to inactive IT Staff user with HTTP 400 Bad Request (BR-14)", async () => {
    const inactiveUser = await getPrisma().user.findUnique({
      where: { email: "inactive.staff@toktickit.com" },
    });
    expect(inactiveUser).toBeDefined();

    // Active IT staff attempts to attribute action to deactivated technician
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions-taken`)
      .set("Authorization", `Bearer ${itStaffToken}`)
      .send({
        description: "Attempted assignment of work log to deactivated technician.",
        result: "Blocked by system safety checks.",
        followUpRequired: false,
        performedById: inactiveUser!.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/performer account is deactivated/i);
  });
});
