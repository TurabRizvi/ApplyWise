import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { isProd } from "../config/env";

// Every error in the app funnels through here. This is what guarantees:
// - Consistent JSON error shape for the frontend to rely on
// - Stack traces / internal details NEVER reach the client in production
//   (a common source of accidental information disclosure)
// - Every unexpected error still gets logged, even if we don't show details
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // Express requires 4 params for an error handler to be recognized as one,
  // even though we don't call next() here — prefixing with _ satisfies the
  // "unused parameter" strict check.
  _next: NextFunction
) {
  // Known, expected errors (bad request, not found, unauthorized, etc.)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Validation errors from Zod — safe to show field-level detail, it's
  // information about the request, not the system internals.
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  // Known Prisma errors — map to safe, generic messages. We deliberately do
  // NOT forward Prisma's raw error message, since it can include table/column
  // names or query fragments.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A record with this value already exists",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Record not found" });
    }
  }

  // Anything else is unexpected — log full detail server-side, return a
  // generic message to the client. Never leak stack traces / internals.
  logger.error("Unhandled error", {
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    message: isProd ? "Something went wrong" : (err as Error).message,
  });
}
