import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 4 Staff Dashboard API", () => {
  let itStaffToken: string;
  let adminToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    // 1. Login as IT Staff (Kevin Patel)
    const staffLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "kevin.patel@toktickit.com", password: "Password123!" });
    itStaffToken = staffLogin.body.token;

    // 2. Login as Admin (John Smith)
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "john.smith@toktickit.com", password: "Password123!" });
    adminToken = adminLogin.body.token;

    // 3. Login as Requester (Jennifer Anderson)
    const reqLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });
    requesterToken = reqLogin.body.token;
  });

  it("API-17: IT Staff dashboard aggregates unassigned, assigned-to-me, and status counts (AC-11, FR-09)", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${itStaffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const { metrics, priorityBreakdown, recentTickets } = res.body.data;

    // Verify metrics exist and are numbers
    expect(typeof metrics.newCount).toBe("number");
    expect(typeof metrics.openCount).toBe("number");
    expect(typeof metrics.inProgressCount).toBe("number");
    expect(typeof metrics.waitingRequesterCount).toBe("number");
    expect(typeof metrics.myAssignedCount).toBe("number");
    expect(typeof metrics.unassignedCount).toBe("number");

    // Verify priority breakdown counts
    expect(typeof priorityBreakdown.urgent).toBe("number");
    expect(typeof priorityBreakdown.high).toBe("number");
    expect(typeof priorityBreakdown.medium).toBe("number");
    expect(typeof priorityBreakdown.low).toBe("number");

    // Verify recent tickets array
    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBeLessThanOrEqual(5);
    if (recentTickets.length > 0) {
      expect(recentTickets[0].summary).toBeDefined();
      expect(recentTickets[0].status).toBeDefined();
    }
  });

  it("API-18: Admin user accessing staff dashboard includes userSummary account metrics (FR-11)", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userSummary).toBeDefined();

    const { userSummary } = res.body.data;
    expect(typeof userSummary.totalUsers).toBe("number");
    expect(typeof userSummary.activeUsers).toBe("number");
    expect(typeof userSummary.requesters).toBe("number");
    expect(typeof userSummary.staff).toBe("number");
    expect(typeof userSummary.admins).toBe("number");
    expect(userSummary.totalUsers).toBeGreaterThan(0);
  });

  it("API-19: Rejects non-staff users (Requesters) with HTTP 403 Forbidden (FR-09)", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Authorization", `Bearer ${requesterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
  });
});
