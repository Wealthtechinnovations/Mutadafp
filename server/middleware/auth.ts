import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    
    // Check if user is blocked
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.isBlocked) {
      return res.status(403).json({ error: "Votre compte a été suspendu. Veuillez contacter l'administration." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }
    next();
  };
};

export const logAudit = async (userId: string | null, action: string, details?: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
};
