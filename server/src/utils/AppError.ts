// A deliberate, "expected" error (bad input, not found, unauthorized) vs.
// an unexpected bug. The error handler middleware uses `isOperational` to
// decide whether it's safe to show the message to the client, or whether
// it should hide the details and just log them.
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
