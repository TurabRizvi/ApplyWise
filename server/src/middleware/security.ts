import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

// 1) Helmet — sets a batch of security-related HTTP headers (prevents
// clickjacking, disables MIME-sniffing, sets a conservative Content-Security
// baseline, etc.). This is a one-line, zero-cost win.
export const helmetMiddleware = helmet();

// 2) CORS — allow ONLY the origins we explicitly list, not "*". A wildcard
// CORS policy on an API that uses cookies/auth is a real vulnerability.
const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // allow no-origin requests (e.g. server-to-server, curl, mobile) only
    // in non-browser contexts — browsers always send an Origin header for
    // cross-origin requests, so this doesn't weaken browser-facing security.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError("Not allowed by CORS", 403));
  },
  credentials: true, // required to allow cookies (refresh token) cross-origin
});

// 3) HTTP Parameter Pollution protection — prevents ?role=candidate&role=admin
// style attacks where duplicate query params could confuse validation logic.
export const hppMiddleware = hpp();

// 4) Rate limiting — generic limiter for all routes, tighter limiter for auth
// routes specifically (this is what stops brute-force login/register abuse).
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // only 10 login/register attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});
