import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { paginationSchema } from "../validators/adminValidators";
import { logger } from "../utils/logger";

// ── Platform overview ──
export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalCandidates, totalResumes, totalApplications, totalOrganizations, totalBatches] =
    await Promise.all([
      prisma.user.count(),
      prisma.resume.count(),
      prisma.jobApplication.count(),
      prisma.organization.count(),
      prisma.screeningBatch.count(),
    ]);

  res.status(200).json({
    success: true,
    data: { totalCandidates, totalResumes, totalApplications, totalOrganizations, totalBatches },
  });
});

// ── Candidate (User) management ──
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: { select: { fullName: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  res.status(200).json({ success: true, data: users, meta: { page, limit, total } });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      profile: true,
      _count: { select: { resumes: true, applications: true } },
    },
  });
  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({ success: true, data: user });
});

// Deactivate, not delete, is the default moderation action — this preserves
// the account's data (resumes, application history) while blocking login,
// which is reversible. Permanent delete is a separate, deliberate action.
export const setUserActiveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, email: true, isActive: true },
  });

  logger.info("Admin changed user active status", { userId: id, isActive, adminId: req.auth!.userId });
  res.status(200).json({ success: true, data: user });
});

export const deleteUserAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Cascade deletes handle resumes/applications/etc automatically, same as
  // when a user deletes their own account.
  await prisma.user.delete({ where: { id } });

  logger.info("Admin deleted user", { userId: id, adminId: req.auth!.userId });
  res.status(200).json({ success: true, message: "User deleted" });
});

// ── Organization (HR side) management ──
export const listOrganizations = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { hrUsers: true, screeningBatches: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.count(),
  ]);

  res.status(200).json({ success: true, data: organizations, meta: { page, limit, total } });
});

export const getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
  const organization = await prisma.organization.findUnique({
    where: { id: req.params.id },
    include: {
      hrUsers: { select: { id: true, email: true, role: true, isActive: true } },
      _count: { select: { screeningBatches: true } },
    },
  });
  if (!organization) throw new AppError("Organization not found", 404);
  res.status(200).json({ success: true, data: organization });
});

export const setHrUserActiveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // hrUserId
  const { isActive } = req.body as { isActive: boolean };

  const hrUser = await prisma.hrUser.update({
    where: { id },
    data: { isActive },
    select: { id: true, email: true, isActive: true },
  });

  logger.info("Admin changed HR user active status", { hrUserId: id, isActive, adminId: req.auth!.userId });
  res.status(200).json({ success: true, data: hrUser });
});

export const deleteOrganizationAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.organization.delete({ where: { id } }); // cascades to hrUsers + batches
  logger.info("Admin deleted organization", { organizationId: id, adminId: req.auth!.userId });
  res.status(200).json({ success: true, message: "Organization deleted" });
});

// ── Resume moderation (view/remove any resume platform-wide) ──
export const listAllResumes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationSchema.parse(req.query);

  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      select: {
        id: true,
        title: true,
        isUploaded: true,
        createdAt: true,
        user: { select: { email: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.resume.count(),
  ]);

  res.status(200).json({ success: true, data: resumes, meta: { page, limit, total } });
});

export const deleteResumeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.resume.delete({ where: { id } });
  logger.info("Admin deleted resume", { resumeId: id, adminId: req.auth!.userId });
  res.status(200).json({ success: true, message: "Resume deleted" });
});
