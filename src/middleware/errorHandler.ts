// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}




