import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { CreateTicketSchema } from "./schemas/ticket.schema.js";
import { ZodError } from "zod";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// ---------------------------------------------------------------------------
// Multer Configuration
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
    }
  }
});

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// Add:  GET /api/categories
//   -> read categories from PostgreSQL via getPrisma().category.findMany(...)
//   -> return each { id, name } in a predictable (id) order
//   -> on failure, respond 500 with a safe message (no internal details)
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ---------------------------------------------------------------------------
// Lab 2 - Issue 2: Development Requester Context
// ---------------------------------------------------------------------------
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().developmentRequester.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { id: "asc" },
    });
    res.status(200).json(requesters);
  } catch (error) {
    console.error("Failed to fetch requesters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/related-systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json(systems);
  } catch (error) {
    console.error("Failed to fetch related systems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Lab 2 - Issue 4: Backend Ticket Creation
// ---------------------------------------------------------------------------
app.post("/api/tickets", async (req: Request, res: Response): Promise<void> => {
  try {
    const data = CreateTicketSchema.parse(req.body);
    
    const ticket = await getPrisma().$transaction(async (tx) => {
      const year = new Date().getFullYear();
      const prefix = `TKT-${year}-`;
      
      const lastTicket = await tx.ticket.findFirst({
        where: { ticketNumber: { startsWith: prefix } },
        orderBy: { ticketNumber: 'desc' },
      });
      
      let nextNumber = 1;
      if (lastTicket) {
        const lastSequence = parseInt(lastTicket.ticketNumber.slice(-6), 10);
        nextNumber = lastSequence + 1;
      }
      
      const ticketNumber = `${prefix}${String(nextNumber).padStart(6, '0')}`;
      
      return tx.ticket.create({
        data: {
          ticketNumber,
          summary: data.summary,
          description: data.description,
          requestedPriority: data.requestedPriority,
          categoryId: data.categoryId,
          relatedSystemId: data.relatedSystemId,
          requesterId: data.requesterId,
        },
      });
    });
    
    res.status(201).json(ticket);
  } catch (error: any) {
    if (error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error.issues });
    } else {
      console.error("Failed to create ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});


// ---------------------------------------------------------------------------
// Lab 2 - Issue 5: Backend Attachment API
// ---------------------------------------------------------------------------
app.post("/api/tickets/:id/attachments", (req: Request, res: Response, next: express.NextFunction) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File size exceeds the 5MB limit." });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    // Verify ticket exists
    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const attachment = await getPrisma().attachment.create({
      data: {
        ticketId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      }
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error("Failed to upload attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/attachments/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const attachmentId = parseInt(req.params.id, 10);
    if (isNaN(attachmentId)) {
      res.status(400).json({ error: "Invalid attachment ID" });
      return;
    }

    const attachment = await getPrisma().attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      res.status(404).json({ error: "Attachment not found" });
      return;
    }

    if (attachment.isRemoved) {
      res.status(410).json({ error: "Gone", reason: attachment.removedReason || "File was removed" });
      return;
    }

    const filePath = path.join(uploadDir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found on server" });
      return;
    }

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${attachment.originalName}"`);
    res.sendFile(filePath);
  } catch (error) {
    console.error("Failed to download attachment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
