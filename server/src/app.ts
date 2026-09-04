import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
import { CreateTicketSchema } from "./schemas/ticket.schema.js";
import { ZodError } from "zod";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

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
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    } else {
      console.error("Failed to create ticket:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default app;
