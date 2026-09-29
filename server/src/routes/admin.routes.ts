import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { getPrisma } from "../prisma.js";
import { authMiddleware, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(requireRole(Role.ADMIN));

// GET /api/admin/users — List users with search & role filter
adminRouter.get("/users", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const roleFilter = req.query.role as Role;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter && Object.values(Role).includes(roleFilter)) {
      whereClause.role = roleFilter;
    }

    const [total, users] = await Promise.all([
      getPrisma().user.count({ where: whereClause }),
      getPrisma().user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          requiresPasswordChange: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { id: "asc" },
        skip,
        take: limit,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        totalItems: total,
        limit,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users — Create a new user
adminRouter.post("/users", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, role, isActive, initialPassword } = req.body;

    if (!name || !email || !role || !initialPassword) {
      res.status(400).json({ error: "Name, email, role, and initial password are required" });
      return;
    }

    if (!Object.values(Role).includes(role as Role)) {
      res.status(400).json({ error: "Invalid role value" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email
    const existing = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      res.status(409).json({ error: "An account with this email address already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const user = await getPrisma().user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        role: role as Role,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        requiresPasswordChange: true,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        requiresPasswordChange: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/users/:id — Edit user details
adminRouter.patch("/users/:id", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const { name, email, role, isActive } = req.body;

    const targetUser = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Safety Rule 1: Prevent self-deactivation
    if (userId === req.user!.id && isActive === false) {
      res.status(400).json({ error: "Safety Violation: You cannot deactivate your own logged-in Administrator account" });
      return;
    }

    // Safety Rule 2: Prevent deactivating or demoting the last active Administrator
    if ((isActive === false || (role && role !== Role.ADMIN)) && targetUser.role === Role.ADMIN && targetUser.isActive) {
      const activeAdminCount = await getPrisma().user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        res.status(400).json({ error: "Safety Violation: Cannot deactivate or demote the system's last active Administrator" });
        return;
      }
    }

    const updateData: any = {};
    if (name && typeof name === "string") updateData.name = name.trim();
    if (email && typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== targetUser.email) {
        const existing = await getPrisma().user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
          res.status(409).json({ error: "An account with this email address already exists" });
          return;
        }
        updateData.email = normalizedEmail;
      }
    }

    if (role && Object.values(Role).includes(role as Role)) {
      updateData.role = role as Role;
    }

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    const updatedUser = await getPrisma().user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        requiresPasswordChange: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/users/:id/reset-password — Set new initial password
adminRouter.post("/users/:id/reset-password", async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { initialPassword } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (!initialPassword || typeof initialPassword !== "string" || initialPassword.length < 6) {
      res.status(400).json({ error: "Initial password must be at least 6 characters long" });
      return;
    }

    const targetUser = await getPrisma().user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const updatedUser = await getPrisma().user.update({
      where: { id: userId },
      data: {
        passwordHash,
        requiresPasswordChange: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        requiresPasswordChange: true,
      },
    });

    res.status(200).json({ success: true, message: "Initial password set. User must change password at next login.", data: updatedUser });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
