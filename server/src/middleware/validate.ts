import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

// Wraps any Zod schema as Express middleware. Validation errors are thrown
// and caught by asyncHandler → errorHandler, so every route gets identical,
// predictable validation error responses without repeating try/catch logic.
export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body); // throws ZodError on failure
    next();
  };
}
