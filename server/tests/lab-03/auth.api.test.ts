import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Auth API", () => {
  it("API-01: Valid User Login returns authenticated response & session cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john.smith@toktickit.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe("ADMIN");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("API-02: Login with inactive account is rejected with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "inactive.requester@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/disabled|invalid/i);
  });

  it("API-03: Login with requiresPasswordChange=true flags user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "david.lee@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.requiresPasswordChange).toBe(true);
  });
});
