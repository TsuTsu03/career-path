// middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });

  try {
    const secret = process.env.JWT_SECRET!;
    const payload = jwt.verify(token, secret) as AuthRequest["user"];
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export function requireRole(role: "student" | "admin") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
