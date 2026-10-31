import { Router, Response } from "express";
import { Role } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import { authMiddleware, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

export const actionsTakenRouter = Router({ mergeParams: true });

// ---------------------------------------------------------------------------
// 1.1. Create Action Taken: POST /api/tickets/:id/actions-taken
// ---------------------------------------------------------------------------
actionsTakenRouter.post(
  "/",
  authMiddleware,
  requireRole(Role.IT_STAFF, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        res.status(400).json({ error: "Invalid ticket ID" });
        return;
      }

      // BR-14: Inactive user safety
      const performer = await getPrisma().user.findUnique({
        where: { id: req.user!.id },
      });
      if (!performer || !performer.isActive) {
        res.status(400).json({ error: "Cannot record action: Performer account is deactivated" });
        return;
      }

      const {
        actionDateTime,
        description,
        result,
        followUpRequired = false,
        followUpNote,
        attachmentNotes,
      } = req.body;

      // Validation
      if (!description || typeof description !== "string" || description.trim().length < 3) {
        res.status(400).json({ error: "Description is required and must be at least 3 characters" });
        return;
      }

      if (!result || typeof result !== "string" || result.trim().length < 3) {
        res.status(400).json({ error: "Result is required and must be at least 3 characters" });
        return;
      }

      const isFollowUp = Boolean(followUpRequired);
      if (isFollowUp && (!followUpNote || typeof followUpNote !== "string" || !followUpNote.trim())) {
        res.status(400).json({
          error: "Follow-up note is mandatory when follow-up is required",
        });
        return;
      }

      const ticket = await getPrisma().ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      const parsedDateTime = actionDateTime ? new Date(actionDateTime) : new Date();

      const action = await getPrisma().actionTaken.create({
        data: {
          ticketId,
          actionDateTime: parsedDateTime,
          description: description.trim(),
          result: result.trim(),
          performedById: req.user!.id,
          followUpRequired: isFollowUp,
          followUpNote: isFollowUp && followUpNote ? followUpNote.trim() : null,
          attachmentNotes: attachmentNotes && typeof attachmentNotes === "string" ? attachmentNotes.trim() : null,
        },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: action,
      });
    } catch (error) {
      console.error("Create Action Taken error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// 1.2. List Actions Taken for a Ticket: GET /api/tickets/:id/actions-taken
// ---------------------------------------------------------------------------
actionsTakenRouter.get(
  "/",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        res.status(400).json({ error: "Invalid ticket ID" });
        return;
      }

      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true, requesterId: true },
      });

      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      // Ownership authorization check for Requesters (BR-06)
      if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
        res.status(403).json({
          error: "Forbidden: You are not authorized to view actions for this ticket",
        });
        return;
      }

      const actions = await getPrisma().actionTaken.findMany({
        where: { ticketId },
        orderBy: [{ actionDateTime: "asc" }, { id: "asc" }],
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: actions,
      });
    } catch (error) {
      console.error("List Actions Taken error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// 1.4. Retrieve Single Action: GET /api/tickets/:id/actions-taken/:actionId
// ---------------------------------------------------------------------------
actionsTakenRouter.get(
  "/:actionId",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const actionId = parseInt(req.params.actionId, 10);

      if (isNaN(ticketId) || isNaN(actionId)) {
        res.status(400).json({ error: "Invalid ticket ID or action ID" });
        return;
      }

      const ticket = await getPrisma().ticket.findUnique({
        where: { id: ticketId },
        select: { id: true, requesterId: true },
      });

      if (!ticket) {
        res.status(404).json({ error: "Ticket not found" });
        return;
      }

      if (req.user!.role === Role.REQUESTER && ticket.requesterId !== req.user!.id) {
        res.status(403).json({
          error: "Forbidden: You are not authorized to view this action",
        });
        return;
      }

      const action = await getPrisma().actionTaken.findFirst({
        where: { id: actionId, ticketId },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      if (!action) {
        res.status(404).json({ error: "Action Taken record not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: action,
      });
    } catch (error) {
      console.error("Get Single Action error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// 1.3. Update Action Taken: PATCH /api/tickets/:id/actions-taken/:actionId
// ---------------------------------------------------------------------------
actionsTakenRouter.patch(
  "/:actionId",
  authMiddleware,
  requireRole(Role.IT_STAFF, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      const actionId = parseInt(req.params.actionId, 10);

      if (isNaN(ticketId) || isNaN(actionId)) {
        res.status(400).json({ error: "Invalid ticket ID or action ID" });
        return;
      }

      const existingAction = await getPrisma().actionTaken.findFirst({
        where: { id: actionId, ticketId },
      });

      if (!existingAction) {
        res.status(404).json({ error: "Action Taken record not found" });
        return;
      }

      const {
        description,
        result,
        followUpRequired,
        followUpNote,
        attachmentNotes,
        lastUpdatedAt,
      } = req.body;

      // Optimistic concurrency control (BR-10)
      if (lastUpdatedAt) {
        const clientTimestamp = new Date(lastUpdatedAt).getTime();
        const serverTimestamp = new Date(existingAction.updatedAt).getTime();

        if (clientTimestamp !== serverTimestamp) {
          res.status(409).json({
            error: "Conflict: Action Taken record was modified by another user. Please refresh and retry.",
          });
          return;
        }
      }

      const isFollowUp = followUpRequired !== undefined ? Boolean(followUpRequired) : existingAction.followUpRequired;
      const effectiveFollowUpNote = followUpNote !== undefined ? followUpNote : existingAction.followUpNote;

      if (isFollowUp && (!effectiveFollowUpNote || typeof effectiveFollowUpNote !== "string" || !effectiveFollowUpNote.trim())) {
        res.status(400).json({
          error: "Follow-up note is mandatory when follow-up is required",
        });
        return;
      }

      const updateData: any = {};
      if (description !== undefined) {
        if (typeof description !== "string" || description.trim().length < 3) {
          res.status(400).json({ error: "Description must be at least 3 characters" });
          return;
        }
        updateData.description = description.trim();
      }

      if (result !== undefined) {
        if (typeof result !== "string" || result.trim().length < 3) {
          res.status(400).json({ error: "Result must be at least 3 characters" });
          return;
        }
        updateData.result = result.trim();
      }

      if (followUpRequired !== undefined) {
        updateData.followUpRequired = isFollowUp;
      }

      if (followUpNote !== undefined) {
        updateData.followUpNote = isFollowUp && effectiveFollowUpNote ? effectiveFollowUpNote.trim() : null;
      } else if (!isFollowUp) {
        updateData.followUpNote = null;
      }

      if (attachmentNotes !== undefined) {
        updateData.attachmentNotes = attachmentNotes && typeof attachmentNotes === "string" ? attachmentNotes.trim() : null;
      }

      const updatedAction = await getPrisma().actionTaken.update({
        where: { id: actionId },
        data: updateData,
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: updatedAction,
      });
    } catch (error) {
      console.error("Update Action Taken error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// 1.5. Audit Trail & Rejection of Deletion: DELETE /api/tickets/:id/actions-taken/:actionId
// ---------------------------------------------------------------------------
actionsTakenRouter.delete("/:actionId", authMiddleware, (_req: AuthenticatedRequest, res: Response): void => {
  res.status(405).json({
    error: "Method Not Allowed: Action Taken records constitute an immutable audit trail and cannot be deleted (BR-16).",
  });
});
