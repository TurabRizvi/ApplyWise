import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env";
import {
  helmetMiddleware,
  corsMiddleware,
  hppMiddleware,
  generalLimiter,
} from "./middleware/security";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import hrAuthRoutes from "./routes/hrAuthRoutes";
import profileRoutes from "./routes/profileRoutes";
import resumeRoutes from "./routes/resumeRoutes";
import assistantRoutes from "./routes/assistantRoutes";
const app = express();

// ── Middleware order is deliberate and matters ──
// Security headers and CORS must run BEFORE routes so every response,
// including error responses, gets them. Body parsing must run before
// validation. Rate limiting runs before routes so abusive requests never
// reach business logic or the database at all.

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(hppMiddleware);
app.use(express.json({ limit: "1mb" })); // cap payload size — prevents oversized-body abuse
app.use(cookieParser(env.COOKIE_SECRET));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

// ── Health check (used by Render to confirm the service is alive) ──
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, status: "ok" });
});

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/hr-auth", hrAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/assistant", assistantRoutes);

// ── 404 handler for unmatched routes ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Centralized error handler — must be registered LAST ──
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`ApplyWise backend running on port ${env.PORT} [${env.NODE_ENV}]`);
});
