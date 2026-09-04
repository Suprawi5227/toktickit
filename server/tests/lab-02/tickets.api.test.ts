import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

// Mock Prisma
const mockPrisma = {
  $transaction: vi.fn(async (callback) => callback(mockPrisma)),
  ticket: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock("../../src/prisma.js", () => {
  return {
    getPrisma: vi.fn(() => mockPrisma),
  };
});

describe("POST /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new ticket with auto-sequence number starting at 000001", async () => {
    const prisma = mockPrisma as any;
    
    prisma.ticket.findFirst.mockResolvedValue(null);
    prisma.ticket.create.mockImplementation((args: any) => Promise.resolve({
      id: 1,
      ...args.data,
    }));

    const response = await request(app)
      .post("/api/tickets")
      .send({
        summary: "Need a new monitor",
        description: "My monitor is broken",
        requestedPriority: "MEDIUM",
        categoryId: 1,
        relatedSystemId: 1,
        requesterId: 1
      });

    expect(response.status).toBe(201);
    const year = new Date().getFullYear();
    expect(response.body.ticketNumber).toBe(`TKT-${year}-000001`);
    expect(response.body.summary).toBe("Need a new monitor");
  });

  it("should increment the sequence if a ticket already exists for the year", async () => {
    const prisma = mockPrisma as any;
    const year = new Date().getFullYear();
    
    prisma.ticket.findFirst.mockResolvedValue({
      ticketNumber: `TKT-${year}-000145`
    });
    
    prisma.ticket.create.mockImplementation((args: any) => Promise.resolve({
      id: 2,
      ...args.data,
    }));

    const response = await request(app)
      .post("/api/tickets")
      .send({
        summary: "VPN access",
        description: "Please grant VPN access",
        requestedPriority: "HIGH",
        categoryId: 2,
        relatedSystemId: 2,
        requesterId: 2
      });

    expect(response.status).toBe(201);
    expect(response.body.ticketNumber).toBe(`TKT-${year}-000146`);
  });

  it("should return 400 Bad Request if validation fails", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        summary: "", // Invalid: empty string
        requestedPriority: "SUPER_HIGH", // Invalid enum
        categoryId: "not a number", // Invalid type
      });

    console.log("RESPONSE BODY:", response.body);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toBeDefined();
    expect(response.body.details.length).toBeGreaterThan(0);
  });
});
