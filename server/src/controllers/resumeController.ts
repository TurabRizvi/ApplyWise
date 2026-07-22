import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertResumeOwnership } from "../utils/resumeOwnership";
import { CreateResumeInput, UpdateResumeInput } from "../validators/resumeValidators";

export const createResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { title } = req.body as CreateResumeInput;

  const resume = await prisma.resume.create({
    data: { userId, title },
  });

  res.status(201).json({ success: true, data: resume });
});

// List view intentionally returns ONLY summary fields, not every nested
// section — a candidate with 10 resumes shouldn't have to download all
// their full content just to see a list of titles. Full detail is fetched
// separately via getResumeById when they open one.
export const listResumes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const resumes = await prisma.resume.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      isUploaded: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  res.status(200).json({ success: true, data: resumes });
});

export const getResumeById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  await assertResumeOwnership(id, userId);

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      education: true,
      experience: true,
      projects: true,
      skills: true,
      certifications: true,
      languages: true,
    },
  });

  res.status(200).json({ success: true, data: resume });
});

export const updateResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;
  const updates = req.body as UpdateResumeInput;

  await assertResumeOwnership(id, userId);

  const resume = await prisma.resume.update({
    where: { id },
    data: updates,
  });

  res.status(200).json({ success: true, data: resume });
});

export const deleteResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  await assertResumeOwnership(id, userId);

  // Deleting the resume automatically deletes all its sections too —
  // this relies on `onDelete: Cascade` set on every section's relation
  // in the Prisma schema (already in place from Day 1), so we don't have
  // to manually delete education/experience/etc rows one by one here.
  await prisma.resume.delete({ where: { id } });

  res.status(200).json({ success: true, message: "Resume deleted" });
});

// Duplicating a resume means deep-copying it AND every section row —
// all wrapped in one transaction, so we never end up with a half-copied
// resume (e.g. the resume row exists but its education entries didn't
// get copied because something failed halfway through).
export const duplicateResume = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { id } = req.params;

  const original = await prisma.resume.findUnique({
    where: { id },
    include: {
      education: true,
      experience: true,
      projects: true,
      skills: true,
      certifications: true,
      languages: true,
    },
  });

  if (!original || original.userId !== userId) {
    throw new AppError("Resume not found", 404);
  }

  const duplicate = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newResume = await tx.resume.create({
      data: {
        userId,
        title: `${original.title} (Copy)`,
        isUploaded: original.isUploaded,
        sourceFileUrl: original.sourceFileUrl,
        extractedText: original.extractedText,
      },
    });

    // Strip the old id/resumeId from each section before re-inserting,
    // since Prisma generates fresh ids and we're pointing them at the new resume.
    if (original.education.length) {
      await tx.education.createMany({
        data: original.education.map(({ institution, degree, fieldOfStudy, startDate, endDate, description }) => ({
          resumeId: newResume.id,
          institution,
          degree,
          fieldOfStudy,
          startDate,
          endDate,
          description,
        })),
      });
    }

    if (original.experience.length) {
      await tx.experience.createMany({
        data: original.experience.map(({ company, role, startDate, endDate, isCurrent, description }) => ({
          resumeId: newResume.id,
          company,
          role,
          startDate,
          endDate,
          isCurrent,
          description,
        })),
      });
    }

    if (original.projects.length) {
      await tx.resumeProject.createMany({
        data: original.projects.map(({ name, description, techStack, projectUrl }) => ({
          resumeId: newResume.id,
          name,
          description,
          techStack,
          projectUrl,
        })),
      });
    }

    if (original.skills.length) {
      await tx.skill.createMany({
        data: original.skills.map(({ name }) => ({ resumeId: newResume.id, name })),
      });
    }

    if (original.certifications.length) {
      await tx.certification.createMany({
        data: original.certifications.map(({ name, issuer, issueDate }) => ({
          resumeId: newResume.id,
          name,
          issuer,
          issueDate,
        })),
      });
    }

    if (original.languages.length) {
      await tx.language.createMany({
        data: original.languages.map(({ name, proficiency }) => ({
          resumeId: newResume.id,
          name,
          proficiency,
        })),
      });
    }

    return newResume;
  });

  res.status(201).json({ success: true, data: duplicate });
});
