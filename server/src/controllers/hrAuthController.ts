import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { env, isProd } from "../config/env";
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from "../utils/tokens";
import { RegisterHrInput, LoginInput } from "../validators/authValidators";
import { logger } from "../utils/logger";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Separate cookie NAME and PATH from the candidate side ("refreshToken" /
// "/api/auth"). This means a recruiter and a candidate account can both be
// logged in in the same browser (e.g. you testing both sides) without their
// sessions overwriting each other's cookie.
const hrRefreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/hr-auth",
};

// Registering an HR account creates BOTH a new Organization AND the first
// HrUser for it, as ORG_ADMIN. Anyone who registers "founds" their org.
// Additional recruiters for that org would be invited by the ORG_ADMIN
// later (a future feature, not built yet — noted so it's not forgotten).
export const registerHr = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, organizationName } = req.body as RegisterHrInput;

  const existing = await prisma.hrUser.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Unable to register with the provided details", 409);
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  // Organization + first HrUser are created together. If HrUser creation
  // somehow failed after the Organization was made, we'd have an orphaned
  // org with no admin — so this MUST be a single transaction, not two
  // separate .create() calls.
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const organization = await tx.organization.create({
      data: { name: organizationName },
    });

    const hrUser = await tx.hrUser.create({
      data: {
        email,
        passwordHash,
        role: "ORG_ADMIN",
        organizationId: organization.id,
      },
      select: { id: true, email: true, role: true, organizationId: true },
    });

    return { organization, hrUser };
  });

  logger.info("HR org + admin registered", { hrUserId: result.hrUser.id, orgId: result.organization.id });

  const payload = { userId: result.hrUser.id, role: result.hrUser.role, accountType: "HR" as const };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.hrRefreshToken.create({
    data: {
      hrUserId: result.hrUser.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("hrRefreshToken", refreshToken, hrRefreshCookieOptions);
  res.status(201).json({
    success: true,
    data: {
      hrUser: { id: result.hrUser.id, email: result.hrUser.email, role: result.hrUser.role },
      organization: { id: result.organization.id, name: result.organization.name },
      accessToken,
    },
  });
});

export const loginHr = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;

  const hrUser = await prisma.hrUser.findUnique({ where: { email } });
  const genericError = () => new AppError("Invalid email or password", 401);

  if (!hrUser || !hrUser.isActive) throw genericError();

  if (hrUser.lockedUntil && hrUser.lockedUntil > new Date()) {
    throw new AppError("Account temporarily locked due to repeated failed attempts. Try again later.", 423);
  }

  const validPassword = await bcrypt.compare(password, hrUser.passwordHash);

  if (!validPassword) {
    const attempts = hrUser.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

    await prisma.hrUser.update({
      where: { id: hrUser.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
      },
    });

    throw genericError();
  }

  await prisma.hrUser.update({
    where: { id: hrUser.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  const payload = { userId: hrUser.id, role: hrUser.role, accountType: "HR" as const };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.hrRefreshToken.create({
    data: {
      hrUserId: hrUser.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("hrRefreshToken", refreshToken, hrRefreshCookieOptions);
  res.status(200).json({
    success: true,
    data: { hrUser: { id: hrUser.id, email: hrUser.email, role: hrUser.role }, accessToken },
  });
});

export const refreshHrAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.hrRefreshToken;
  if (!token) throw new AppError("No refresh token provided", 401);

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const tokenHash = hashToken(token);
  const stored = await prisma.hrRefreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError("Refresh token is no longer valid, please log in again", 401);
  }

  await prisma.hrRefreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  await prisma.hrRefreshToken.create({
    data: {
      hrUserId: payload.userId,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie("hrRefreshToken", newRefreshToken, hrRefreshCookieOptions);
  res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
});

export const logoutHr = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.hrRefreshToken;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.hrRefreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }
  res.clearCookie("hrRefreshToken", { path: "/api/hr-auth" });
  res.status(200).json({ success: true, message: "Logged out" });
});

// "Who am I" endpoint — the frontend needs this because login/refresh only
// return the bare hrUser {id, email, role}, not the organization's name.
// Rather than duplicating organization lookup logic in multiple places,
// this is the one place the frontend asks "who is logged in, and what
// organization are they part of."
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;

  const hrUser = await prisma.hrUser.findUnique({
    where: { id: hrUserId },
    select: {
      id: true,
      email: true,
      role: true,
      organization: { select: { id: true, name: true } },
    },
  });

  if (!hrUser) throw new AppError("HR account not found", 404);

  res.status(200).json({ success: true, data: hrUser });
});
