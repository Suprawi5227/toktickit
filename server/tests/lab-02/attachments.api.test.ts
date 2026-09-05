import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";

const mockPrisma = {
  ticket: {
    findUnique: vi.fn(),
  },
  attachment: {
    create: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock("../../src/prisma.js", () => {
  return {
    getPrisma: vi.fn(() => mockPrisma),
  };
});

describe("Attachment API (Issue 5)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/tickets/:id/attachments", () => {
    it("should upload a valid JPG file", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.attachment.count.mockResolvedValue(0);
      mockPrisma.attachment.create.mockImplementation((args: any) => Promise.resolve({
        id: 1,
        ...args.data,
      }));

      const res = await request(app)
        .post("/api/tickets/1/attachments")
        .attach("file", Buffer.from("fake image content"), {
          filename: "test.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(201);
      expect(res.body.originalName).toBe("test.jpg");
      expect(res.body.mimeType).toBe("image/jpeg");
    });

    it("should reject invalid file types", async () => {
      const res = await request(app)
        .post("/api/tickets/1/attachments")
        .attach("file", Buffer.from("fake text content"), {
          filename: "test.txt",
          contentType: "text/plain",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Invalid file type");
    });

    it("should upload a valid WEBP file", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.attachment.count.mockResolvedValue(0);
      mockPrisma.attachment.create.mockImplementation((args: any) => Promise.resolve({
        id: 2,
        ...args.data,
      }));

      const res = await request(app)
        .post("/api/tickets/1/attachments")
        .attach("file", Buffer.from("fake webp content"), {
          filename: "test.webp",
          contentType: "image/webp",
        });

      expect(res.status).toBe(201);
      expect(res.body.mimeType).toBe("image/webp");
    });

    it("should reject upload if ticket already has 5 active attachments", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.attachment.count.mockResolvedValue(5);

      const res = await request(app)
        .post("/api/tickets/1/attachments")
        .attach("file", Buffer.from("fake image content"), {
          filename: "test2.jpg",
          contentType: "image/jpeg",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Maximum of 5 active attachments allowed per ticket.");
    });
  });

  describe("GET /api/attachments/:id", () => {
    it("should return 410 Gone if attachment is removed", async () => {
      mockPrisma.attachment.findUnique.mockResolvedValue({
        id: 1,
        isRemoved: true,
        removedReason: "Inappropriate content",
      });

      const res = await request(app).get("/api/attachments/1");

      expect(res.status).toBe(410);
      expect(res.body.error).toBe("Gone");
      expect(res.body.reason).toBe("Inappropriate content");
    });
  });
});
