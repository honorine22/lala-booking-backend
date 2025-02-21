import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from `Bearer <token>`
  
  if (!token) {
     res.status(401).json({ error: "Unauthorized: No token provided" });
     return;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
     res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
