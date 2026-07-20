import winston from "winston";
import { isProd } from "../config/env";

// Structured logging from day one. This matters for two reasons:
// 1. In production, "console.log" output is hard to search/filter.
// 2. We NEVER want to accidentally log passwords, tokens, or full request
//    bodies — using a logger with explicit fields (rather than dumping
//    whole objects) forces us to be deliberate about what gets logged.
export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    isProd ? winston.format.json() : winston.format.simple()
  ),
  transports: [new winston.transports.Console()],
});
