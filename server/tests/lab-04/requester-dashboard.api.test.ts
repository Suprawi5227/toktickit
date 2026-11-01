import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 4 Requester Dashboard API", () => {
  let jenniferToken: string;
  let zeroUserToken: string;

  beforeAll(async () => {
    const prisma = getPrisma();

    // 1. Ensure zero-ticket test requester exists
    const passwordHash = await bcrypt.hash("Password123!", 10);
    await prisma.user.upsert({
      where: { email: "zero.requester@example.com" },
      update: { passwordHash, isActive: true },
      create: {
        name: "Zero Requester",
        email: "zero.requester@example.com",
        passwordHash,
        role: "REQUESTER",
        isActive: true,
      },
    });

    // 2. Login as Jennifer Anderson
    const jenniferLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });
    jenniferToken = jenniferLogin.body.token;

    // 3. Login as Zero Requester
    const zeroLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "zero.requester@example.com", password: "Password123!" });
    zeroUserToken = zeroLogin.body.token;
  });

  it("API-20: Requester dashboard returns metrics strictly scoped to authenticated user (AC-12, FR-10, BR-12)", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Authorization", `Bearer ${jenniferToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const { metrics, recentTickets } = res.body.data;

    // Verify all metrics exist and are numbers
    expect(typeof metrics.totalOpen).toBe("number");
    expect(typeof metrics.inProgressCount).toBe("number");
    expect(typeof metrics.waitingOnMeCount).toBe("number");
    expect(typeof metrics.resolvedCount).toBe("number");
    expect(typeof metrics.closedCount).toBe("number");

    // Total open should equal inProgress + waitingOnMe + other open statuses
    expect(metrics.totalOpen).toBeGreaterThanOrEqual(metrics.inProgressCount + metrics.waitingOnMeCount);

    // Verify recent tickets are scoped to the user
    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBeLessThanOrEqual(5);

    const prisma = getPrisma();
    const jenniferUser = await prisma.user.findUnique({
      where: { email: "jennifer.anderson@example.com" },
    });

    for (const ticket of recentTickets) {
      const dbTicket = await prisma.ticket.findUnique({
        where: { id: ticket.id },
      });
      expect(dbTicket?.requesterId).toBe(jenniferUser?.id);
    }
  });

  it("API-21: Returns numeric 0 for zero ticket counts without calculation error (AC-13, BR-13)", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Authorization", `Bearer ${zeroUserToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const { metrics, recentTickets } = res.body.data;

    // Must return numeric 0, not null, undefined, or NaN
    expect(metrics.totalOpen).toBe(0);
    expect(metrics.inProgressCount).toBe(0);
    expect(metrics.waitingOnMeCount).toBe(0);
    expect(metrics.resolvedCount).toBe(0);
    expect(metrics.closedCount).toBe(0);

    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBe(0);
  });

  it("API-22: Rejects unauthenticated access to requester dashboard with HTTP 401 Unauthorized (FR-10)", async () => {
    // No Authorization header
    const resNoToken = await request(app).get("/api/dashboards/requester");
    expect(resNoToken.status).toBe(401);

    // Invalid Authorization header
    const resBadToken = await request(app)
      .get("/api/dashboards/requester")
      .set("Authorization", "Bearer invalid-token-xyz");
    expect(resBadToken.status).toBe(401);
  });
});
