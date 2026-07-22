import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertResumeOwnership } from "../utils/resumeOwnership";
import { ExperienceInput } from "../validators/resumeValidators";

export const addExperience = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as ExperienceInput;

  await assertResumeOwnership(resumeId, userId);

  const experience = await prisma.experience.create({
    data: { resumeId, ...data },
  });

  res.status(201).json({ success: true, data: experience });
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, experienceId } = req.params;
  const data = req.body as Partial<ExperienceInput>;

  await assertResumeOwnership(resumeId, userId);

  const existing = await prisma.experience.findUnique({ where: { id: experienceId } });
  if (!existing || existing.resumeId !== resumeId) {
    throw new AppError("Experience entry not found", 404);
  }

  const experience = await prisma.experience.update({
    where: { id: experienceId },
    data,
  });

  res.status(200).json({ success: true, data: experience });
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, experienceId } = req.params;

  await assertResumeOwnership(resumeId, userId);

  const existing = await prisma.experience.findUnique({ where: { id: experienceId } });
  if (!existing || existing.resumeId !== resumeId) {
    throw new AppError("Experience entry not found", 404);
  }

  await prisma.experience.delete({ where: { id: experienceId } });

  res.status(200).json({ success: true, message: "Experience entry deleted" });
});
