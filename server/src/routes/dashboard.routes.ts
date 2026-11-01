import { Router, Response } from "express";
import { Role, TicketStatus, ITPriority } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import { authMiddleware, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

export const dashboardRouter = Router();

// ---------------------------------------------------------------------------
// 2.1. IT Staff & Admin Dashboard Metrics: GET /api/dashboards/staff
// ---------------------------------------------------------------------------
dashboardRouter.get(
  "/staff",
  authMiddleware,
  requireRole(Role.IT_STAFF, Role.ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const prisma = getPrisma();
      const currentUserId = req.user!.id;
      const isAdmin = req.user!.role === Role.ADMIN;

      // 1. Authoritative metric aggregations (BR-11)
      const [
        newCount,
        openCount,
        inProgressCount,
        waitingRequesterCount,
        myAssignedCount,
        unassignedCount,
      ] = await Promise.all([
        prisma.ticket.count({ where: { status: TicketStatus.NEW } }),
        prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
        prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        prisma.ticket.count({ where: { status: TicketStatus.WAITING_FOR_REQUESTER } }),
        prisma.ticket.count({ where: { ownerId: currentUserId } }),
        prisma.ticket.count({ where: { ownerId: null } }),
      ]);

      // 2. Priority breakdown
      const [urgent, high, medium, low] = await Promise.all([
        prisma.ticket.count({ where: { itPriority: ITPriority.URGENT } }),
        prisma.ticket.count({ where: { itPriority: ITPriority.HIGH } }),
        prisma.ticket.count({ where: { itPriority: ITPriority.MEDIUM } }),
        prisma.ticket.count({ where: { itPriority: ITPriority.LOW } }),
      ]);

      // 3. User summary (Included for Admins per FR-11 and Section 2.1)
      let userSummary = null;
      if (isAdmin) {
        const [totalUsers, activeUsers, requesters, staff, admins] = await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { isActive: true } }),
          prisma.user.count({ where: { role: Role.REQUESTER } }),
          prisma.user.count({ where: { role: Role.IT_STAFF } }),
          prisma.user.count({ where: { role: Role.ADMIN } }),
        ]);

        userSummary = {
          totalUsers,
          activeUsers,
          requesters,
          staff,
          admins,
        };
      }

      // 4. Up to 5 most recent / urgent tickets
      const recent = await prisma.ticket.findMany({
        take: 5,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          status: true,
          itPriority: true,
          updatedAt: true,
          owner: {
            select: { id: true, name: true },
          },
        },
      });

      const recentTickets = recent.map((t) => ({
        id: t.id,
        ticketNo: t.ticketNumber,
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        status: t.status,
        itPriority: t.itPriority,
        updatedAt: t.updatedAt,
        owner: t.owner,
      }));

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            newCount,
            openCount,
            inProgressCount,
            waitingRequesterCount,
            myAssignedCount,
            unassignedCount,
          },
          priorityBreakdown: {
            urgent,
            high,
            medium,
            low,
          },
          userSummary,
          recentTickets,
        },
      });
    } catch (error) {
      console.error("Staff Dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ---------------------------------------------------------------------------
// 2.2. Requester Dashboard Metrics: GET /api/dashboards/requester
// ---------------------------------------------------------------------------
dashboardRouter.get(
  "/requester",
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const prisma = getPrisma();
      const currentUserId = req.user!.id;

      // Authoritative scoped queries (BR-12)
      const openStatuses: TicketStatus[] = [
        TicketStatus.NEW,
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
        TicketStatus.WAITING_FOR_REQUESTER,
        TicketStatus.REOPENED,
      ];

      const [
        totalOpen,
        inProgressCount,
        waitingOnMeCount,
        resolvedCount,
        closedCount,
      ] = await Promise.all([
        prisma.ticket.count({
          where: {
            requesterId: currentUserId,
            status: { in: openStatuses },
          },
        }),
        prisma.ticket.count({
          where: {
            requesterId: currentUserId,
            status: TicketStatus.IN_PROGRESS,
          },
        }),
        prisma.ticket.count({
          where: {
            requesterId: currentUserId,
            status: TicketStatus.WAITING_FOR_REQUESTER,
          },
        }),
        prisma.ticket.count({
          where: {
            requesterId: currentUserId,
            status: TicketStatus.RESOLVED,
          },
        }),
        prisma.ticket.count({
          where: {
            requesterId: currentUserId,
            status: TicketStatus.CLOSED,
          },
        }),
      ]);

      // Up to 5 most recent tickets belonging to requester
      const recent = await prisma.ticket.findMany({
        where: { requesterId: currentUserId },
        take: 5,
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          ticketNumber: true,
          summary: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const recentTickets = recent.map((t) => ({
        id: t.id,
        ticketNo: t.ticketNumber,
        ticketNumber: t.ticketNumber,
        summary: t.summary,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalOpen,
            inProgressCount,
            waitingOnMeCount,
            resolvedCount,
            closedCount,
          },
          recentTickets,
        },
      });
    } catch (error) {
      console.error("Requester Dashboard error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
