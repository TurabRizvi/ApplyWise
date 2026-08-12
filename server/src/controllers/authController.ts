import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { env, isProd } from "../config/env";
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from "../utils/tokens";
import { RegisterCandidateInput, LoginInput } from "../validators/authValidators";
import { logger } from "../utils/logger";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// httpOnly + secure + sameSite cookie for the refresh token. Client-side JS
// can never read this, which is the whole point — it neutralizes XSS-based
// token theft for the long-lived credential.
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd, // required to be true whenever sameSite is "none" — browsers reject it otherwise
  // "strict" works locally (frontend and backend are both localhost), but breaks entirely
  // once deployed, since your frontend and backend will be on different domains
  // (e.g. vercel.app vs onrender.com) and "strict"/"lax" cookies don't get sent
  // cross-domain even with credentials: "include". "none" is required for that,
  // but only in production — locally, "lax" is safer and doesn't need HTTPS.
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches JWT_REFRESH_EXPIRES_IN default
  path: "/api/auth", // scope the cookie narrowly, not sent on every route
};

export const registerCandidate = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body as RegisterCandidateInput;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague message — do not reveal whether the email exists.
    // This is a small but real defense against account enumeration.
    throw new AppError("Unable to register with the provided details", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: { create: { fullName } },
    },
    select: { id: true, email: true, role: true },
  });

  logger.info("Candidate registered", { userId: user.id });

  const payload = { userId: user.id, role: user.role, accountType: "USER" as const };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.status(201).json({
    success: true,
    data: { user: { id: user.id, email: user.email, role: user.role }, accessToken },
  });
});

export const loginCandidate = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic message whether the email doesn't exist OR the password is
  // wrong — again, don't help an attacker enumerate valid accounts.
  const genericError = () => new AppError("Invalid email or password", 401);

  if (!user || !user.isActive) throw genericError();

  // Account lockout: after MAX_FAILED_ATTEMPTS, block login attempts for a
  // cooldown window even with the correct password. Stops brute-force.
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError(
      `Account temporarily locked due to repeated failed attempts. Try again later.`,
      423
    );
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      },
    });

    throw genericError();
  }

  // Successful login — reset failure counter.
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const payload = { userId: user.id, role: user.role, accountType: "USER" as const };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  res.status(200).json({
    success: true,
    data: { user: { id: user.id, email: user.email, role: user.role }, accessToken },
  });
});

// Refresh token rotation: every time a refresh token is used, it's revoked
// and a brand new one is issued. If a stolen refresh token is ever replayed
// after the legitimate user has already refreshed, it will be rejected as
// already-revoked — this limits how long a stolen token stays useful.
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError("No refresh token provided", 401);

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const tokenHash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token is no longer valid, please log in again", 401);
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId: payload.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);
  res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.status(200).json({ success: true, message: "Logged out" });
});
