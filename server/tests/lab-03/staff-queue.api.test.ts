import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Staff Queue API", () => {
  it("API-06: IT Staff can query ticket queue with search and status filtering", async () => {
    // Login as IT Staff (Kevin Patel)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "kevin.patel@toktickit.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/tickets/queue?search=VPN&status=OPEN")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
