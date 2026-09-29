import { Router, Response } from "express";
import { Role, TicketStatus, ITPriority } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import { authMiddleware, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

export const staffRouter = Router();

// Permitted Ticket Status Transitions Matrix (BR-08)
const PERMITTED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  NEW: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.CANCELLED],
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  IN_PROGRESS: [TicketStatus.WAITING_FOR_REQUESTER, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  WAITING_FOR_REQUESTER: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  RESOLVED: [TicketStatus.CLOSED, TicketStatus.REOPENED],
  CLOSED: [TicketStatus.REOPENED],
  REOPENED: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CANCELLED],
  CANCELLED: [],
};

// GET /api/tickets/queue — IT Staff Ticket Queue
staffRouter.get("/queue", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const status = req.query.status as TicketStatus;
    const itPriority = req.query.itPriority as ITPriority;
    const ownerFilter = req.query.owner as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === "asc" ? "asc" : "desc";

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { ticketNumber: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && Object.values(TicketStatus).includes(status)) {
      whereClause.status = status;
    }

    if (itPriority && Object.values(ITPriority).includes(itPriority)) {
      whereClause.itPriority = itPriority;
    }

    if (ownerFilter === "unassigned") {
      whereClause.ownerId = null;
    } else if (ownerFilter === "mine") {
      whereClause.ownerId = req.user!.id;
    } else if (ownerFilter && !isNaN(parseInt(ownerFilter, 10))) {
      whereClause.ownerId = parseInt(ownerFilter, 10);
    }

    const orderBy: any = {};
    if (sortBy === "itPriority" || sortBy === "requestedPriority") {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === "ticketNumber") {
      orderBy.ticketNumber = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [total, tickets] = await Promise.all([
      getPrisma().ticket.count({ where: whereClause }),
      getPrisma().ticket.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true } },
          relatedSystem: { select: { id: true, name: true } },
          requester: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: tickets,
      meta: {
        totalItems: total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Queue fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tickets/:id/claim
staffRouter.patch("/:id/claim", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const updateData: any = { ownerId: req.user!.id };
    if (ticket.status === TicketStatus.NEW) {
      updateData.status = TicketStatus.OPEN;
    }

    const updated = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tickets/:id/reassign
staffRouter.patch("/:id/reassign", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { ownerId } = req.body;

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (ownerId !== null && (typeof ownerId !== "number" || isNaN(ownerId))) {
      res.status(400).json({ error: "Invalid owner ID" });
      return;
    }

    if (ownerId !== null) {
      const targetUser = await getPrisma().user.findUnique({ where: { id: ownerId } });
      if (!targetUser || !targetUser.isActive || (targetUser.role !== Role.IT_STAFF && targetUser.role !== Role.ADMIN)) {
        res.status(400).json({ error: "Assigned owner must be an active IT Staff or Administrator user" });
        return;
      }
    }

    const updated = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { ownerId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        requester: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Reassign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tickets/:id/status
staffRouter.patch("/:id/status", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { status } = req.body as { status: TicketStatus };

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (!status || !Object.values(TicketStatus).includes(status)) {
      res.status(400).json({ error: "Invalid ticket status value" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const allowedNextStatuses = PERMITTED_TRANSITIONS[ticket.status] || [];
    if (!allowedNextStatuses.includes(status) && ticket.status !== status) {
      res.status(400).json({
        error: `Cannot transition status from '${ticket.status}' to '${status}'. Permitted next statuses: ${allowedNextStatuses.join(", ")}`,
      });
      return;
    }

    const updated = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Status transition error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tickets/:id/it-priority
staffRouter.patch("/:id/it-priority", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { itPriority } = req.body as { itPriority: ITPriority };

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (!itPriority || !Object.values(ITPriority).includes(itPriority)) {
      res.status(400).json({ error: "Invalid IT Priority value" });
      return;
    }

    const updated = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { itPriority },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("IT priority update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/tickets/:id/indicate-resolved (Requester indication)
staffRouter.patch("/:id/indicate-resolved", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You do not own this ticket" });
      return;
    }

    const updated = await getPrisma().ticket.update({
      where: { id: ticketId },
      data: { requesterResolvedInd: true },
    });

    // Create automated public comment
    await getPrisma().publicComment.create({
      data: {
        ticketId,
        authorId: req.user!.id,
        content: "[System] Requester indicated that the reported problem appears resolved.",
      },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Indicate resolved error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/tickets/:id/comments & POST /api/tickets/:id/comments
staffRouter.get("/:id/comments", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You are not authorized to view comments on this ticket" });
      return;
    }

    const comments = await getPrisma().publicComment.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

staffRouter.post("/:id/comments", authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Comment content cannot be empty" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
      res.status(403).json({ error: "Forbidden: You cannot comment on an unowned ticket" });
      return;
    }

    const comment = await getPrisma().publicComment.create({
      data: {
        ticketId,
        authorId: req.user!.id,
        content: content.trim(),
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/tickets/:id/notes & POST /api/tickets/:id/notes — Internal Notes (IT Staff & Admin strictly)
staffRouter.get("/:id/notes", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    const notes = await getPrisma().internalNote.findMany({
      where: { ticketId },
      include: { author: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

staffRouter.post("/:id/notes", authMiddleware, requireRole(Role.IT_STAFF, Role.ADMIN), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { content } = req.body;

    if (isNaN(ticketId)) {
      res.status(400).json({ error: "Invalid ticket ID" });
      return;
    }

    if (!content || typeof content !== "string" || !content.trim()) {
      res.status(400).json({ error: "Internal Note content cannot be empty" });
      return;
    }

    const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }

    const note = await getPrisma().internalNote.create({
      data: {
        ticketId,
        authorId: req.user!.id,
        content: content.trim(),
      },
      include: { author: { select: { id: true, name: true, role: true } } },
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
