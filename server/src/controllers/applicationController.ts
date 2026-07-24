import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import {
  CreateApplicationInput,
  UpdateApplicationInput,
  applicationQuerySchema,
} from "../validators/applicationValidators";

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const data = req.body as CreateApplicationInput;

  const application = await prisma.jobApplication.create({
    data: { userId, ...data },
  });

  res.status(201).json({ success: true, data: application });
});

// Filter/search happens at the database level (not fetched-then-filtered
// in JS) — this matters once a candidate has hundreds of applications,
// since the DB can use its index instead of us loading everything into
// memory just to throw most of it away.
export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { status, search } = applicationQuerySchema.parse(req.query);

  const applications = await prisma.jobApplication.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: "insensitive" } },
          { position: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: { updatedAt: "desc" },
  });

  res.status(200).json({ success: true, data: applications });
});

async function assertApplicationOwnership(id: string, userId: string) {
  const application = await prisma.jobApplication.findUnique({ where: { id } });
  if (!application || application.userId !== userId) {
    throw new AppError("Application not found", 404);
  }
  return application;
}

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const application = await assertApplicationOwnership(req.params.id, userId);
  res.status(200).json({ success: true, data: application });
});

export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;
  const data = req.body as UpdateApplicationInput;

  await assertApplicationOwnership(id, userId);

  const application = await prisma.jobApplication.update({ where: { id }, data });
  res.status(200).json({ success: true, data: application });
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  await assertApplicationOwnership(id, userId);

  await prisma.jobApplication.delete({ where: { id } });
  res.status(200).json({ success: true, message: "Application deleted" });
});
