import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "../../src/app.js";

describe("Lab 2 - Development Requesters API", () => {
  it("GET /api/requesters should return 200 and a list of only active requesters", async () => {
    const res = await request(app).get("/api/requesters");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Check that we have at least 4 active requesters as per seed
    expect(res.body.length).toBeGreaterThanOrEqual(4);
    
    // Verify that the inactive user is NOT returned
    const inactiveUser = res.body.find((r: any) => r.email === "inactive@example.com");
    expect(inactiveUser).toBeUndefined();
    
    const activeUser = res.body.find((r: any) => r.email === "jennifer.anderson@example.com");
    expect(activeUser).toBeDefined();
  });

  it("GET /api/related-systems should return 200 and a list of systems", async () => {
    const res = await request(app).get("/api/related-systems");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(6);
  });
});
