import { PrismaClient } from "@prisma/client";
import { isProd } from "./env";

// Without this singleton pattern, nodemon hot-reloads in dev would spawn a
// new PrismaClient (and new DB connection pool) on every file save, and
// you'd eventually exhaust Neon's connection limit without knowing why.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: isProd ? ["error", "warn"] : ["query", "error", "warn"],
  });

if (!isProd) {
  global.__prisma = prisma;
}
