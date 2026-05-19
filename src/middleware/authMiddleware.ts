// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { JwtUtil } from "../utils/jwtUtil";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export class AuthMiddleware {
  static authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res
          .status(401)
          .json({ message: "Authorization header is missing" });
      }

      if (!authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ message: "Invalid authorization format" });
      }

      const token = authHeader.split(" ")[1];
      const decoded = JwtUtil.verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error: any) {
      return res
        .status(401)
        .json({ message: error.message || "Authentication failed" });
    }
  }

  static authorize(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  }
}
