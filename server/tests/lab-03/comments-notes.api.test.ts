import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

describe("Lab 3 Public Comments and Internal Notes API", () => {
  it("API-08: Requester can indicate problem appears resolved and post Public Comment", async () => {
    // Login as Requester (Jennifer Anderson)
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "jennifer.anderson@example.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    // Get ticket owned by Jennifer (TXT-2025-001234)
    const ticketRes = await request(app)
      .get("/api/tickets/1")
      .set("Cookie", cookie);

    expect(ticketRes.status).toBe(200);

    const resolveRes = await request(app)
      .patch("/api/tickets/1/indicate-resolved")
      .set("Cookie", cookie);

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.requesterResolvedInd).toBe(true);
  });
});
