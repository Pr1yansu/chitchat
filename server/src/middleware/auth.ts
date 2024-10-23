import type { Request, Response, NextFunction } from "express";

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated() && !req.user.isBanned) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
