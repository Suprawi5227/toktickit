import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Admin User Management API", () => {
  it("API-09: Creating user with duplicate email returns 409 Conflict / 400 Bad Request", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "john.smith@toktickit.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .post("/api/admin/users")
      .set("Cookie", cookie)
      .send({
        name: "Duplicate User",
        email: "jennifer.anderson@example.com", // existing
        role: "REQUESTER",
        initialPassword: "Password123!",
      });

    expect([400, 409]).toContain(res.status);
    expect(res.body.error).toMatch(/already exists/i);
  });

  it("API-10: Admin deactivating own account is blocked", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "john.smith@toktickit.com", password: "Password123!" });

    const adminUser = loginRes.body.user;
    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .patch(`/api/admin/users/${adminUser.id}`)
      .set("Cookie", cookie)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot deactivate/i);
  });
});
