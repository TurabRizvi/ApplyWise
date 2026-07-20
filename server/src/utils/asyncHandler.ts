import { Request, Response, NextFunction, RequestHandler } from "express";

// Without this, a thrown error inside an `async` route handler does NOT get
// caught by Express's default error handling — it becomes an unhandled
// promise rejection, which can crash the whole process. Wrapping every
// async controller in this is a one-time cost that prevents an entire
// category of "the server randomly died" bugs later.
export const asyncHandler =
  (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
