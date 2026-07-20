import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/tokens";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

// Extend Express's Request type so `req.auth` is typed everywhere it's used,
// instead of `any`.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

// Authentication: confirms WHO is making the request.
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
});

// Authorization: confirms WHAT the authenticated user is allowed to do.
// Usage: requireRole(["ADMIN"]) or requireRole(["CANDIDATE"])
// Kept as a SEPARATE middleware from requireAuth on purpose — authentication
// and authorization are different concerns and mixing them makes bugs
// (e.g. accidentally allowing any logged-in user into an admin route) easier
// to introduce.
export function requireRole(allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      throw new AppError("Authentication required", 401);
    }
    if (!allowedRoles.includes(req.auth.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
}
