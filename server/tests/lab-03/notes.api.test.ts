import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Internal Notes API", () => {
  it("API-05: Requester requesting Internal Notes returns 403 Forbidden without leaking note content", async () => {
    // Login as Requester (Jennifer Anderson)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app)
      .get("/api/tickets/1/notes")
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.data).toBeUndefined();
  });
});
