import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Staff Ticket Detail & Operations API", () => {
  it("API-07: IT Staff can claim an unassigned ticket", async () => {
    // Login as IT Staff (Kevin Patel)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "kevin.patel@toktickit.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    // Find an unassigned ticket (TXT-2025-001233)
    const queueRes = await request(app)
      .get("/api/tickets/queue?search=TXT-2025-001233")
      .set("Cookie", cookie);

    const ticket = queueRes.body.data?.[0];
    expect(ticket).toBeDefined();

    const claimRes = await request(app)
      .patch(`/api/tickets/${ticket.id}/claim`)
      .set("Cookie", cookie);

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.data.ownerId).toBe(loginRes.body.user.id);
  });
});
