import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Authorization API", () => {
  it("API-04: Requester cannot view tickets belonging to another user", async () => {
    // Login as Michael Brown
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "michael.brown@example.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    // Try accessing Jennifer Anderson's ticket (TXT-2025-001234)
    // First find ticket ID for TXT-2025-001234
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "john.smith@toktickit.com", password: "Password123!" });
    const queueRes = await request(app)
      .get("/api/tickets/queue?search=TXT-2025-001234")
      .set("Cookie", adminLogin.headers["set-cookie"]);

    const targetTicket = queueRes.body.data?.[0];
    expect(targetTicket).toBeDefined();

    const res = await request(app)
      .get(`/api/tickets/${targetTicket.id}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
  });
});
