import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertResumeOwnership } from "../utils/resumeOwnership";
import { EducationInput } from "../validators/resumeValidators";

// Every one of these checks resume ownership FIRST, before touching the
// education row itself. This stops a candidate from adding/editing/deleting
// an education entry on a resume that isn't theirs, even if they somehow
// knew a valid resumeId.

export const addEducation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as EducationInput;

  await assertResumeOwnership(resumeId, userId);

  const education = await prisma.education.create({
    data: { resumeId, ...data },
  });

  res.status(201).json({ success: true, data: education });
});

export const updateEducation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, educationId } = req.params;
  const data = req.body as Partial<EducationInput>;

  await assertResumeOwnership(resumeId, userId);

  const existing = await prisma.education.findUnique({ where: { id: educationId } });
  if (!existing || existing.resumeId !== resumeId) {
    throw new AppError("Education entry not found", 404);
  }

  const education = await prisma.education.update({
    where: { id: educationId },
    data,
  });

  res.status(200).json({ success: true, data: education });
});

export const deleteEducation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, educationId } = req.params;

  await assertResumeOwnership(resumeId, userId);

  const existing = await prisma.education.findUnique({ where: { id: educationId } });
  if (!existing || existing.resumeId !== resumeId) {
    throw new AppError("Education entry not found", 404);
  }

  await prisma.education.delete({ where: { id: educationId } });

  res.status(200).json({ success: true, message: "Education entry deleted" });
});
