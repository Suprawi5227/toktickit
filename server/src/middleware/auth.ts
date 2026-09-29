import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { getPrisma } from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "toktickit-secret-jwt-key-lab3";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  requiresPasswordChange: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: { id: number; email: string; name: string; role: Role; requiresPasswordChange: boolean }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.toktickit_session;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    if (!token && req.headers["x-session-token"]) {
      token = req.headers["x-session-token"] as string;
    }

    if (!token) {
      res.status(401).json({ error: "Unauthenticated access" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user exists and is active in DB
    const user = await getPrisma().user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, requiresPasswordChange: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Account is disabled or user not found" });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requiresPasswordChange: user.requiresPasswordChange,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired session token" });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthenticated access" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: You do not have permission to perform this action" });
      return;
    }

    next();
  };
}

export function enforcePasswordChange(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.user?.requiresPasswordChange && req.path !== "/api/auth/change-password" && req.path !== "/api/auth/logout" && req.path !== "/api/auth/me") {
    res.status(403).json({
      error: "Mandatory password change required before using the application",
      requiresPasswordChange: true,
    });
    return;
  }
  next();
}
