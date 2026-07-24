import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertResumeOwnership } from "../utils/resumeOwnership";
import { SkillInput, ProjectInput, CertificationInput, LanguageInput } from "../validators/sectionValidators";

// Skills, Projects, Certifications, and Languages all follow the exact same
// pattern as Education/Experience from Day 3: verify resume ownership,
// verify the specific entry belongs to that resume, then act. Rather than
// write four near-identical files, they're grouped here since each is only
// a few lines once the shared ownership check does the heavy lifting.

// ── Skills ──
export const addSkill = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as SkillInput;
  await assertResumeOwnership(resumeId, userId);
  const skill = await prisma.skill.create({ data: { resumeId, ...data } });
  res.status(201).json({ success: true, data: skill });
});

export const deleteSkill = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, skillId } = req.params;
  await assertResumeOwnership(resumeId, userId);
  const existing = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!existing || existing.resumeId !== resumeId) throw new AppError("Skill not found", 404);
  await prisma.skill.delete({ where: { id: skillId } });
  res.status(200).json({ success: true, message: "Skill deleted" });
});

// ── Projects ──
export const addProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as ProjectInput;
  await assertResumeOwnership(resumeId, userId);
  const project = await prisma.resumeProject.create({ data: { resumeId, ...data } });
  res.status(201).json({ success: true, data: project });
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, projectId } = req.params;
  const data = req.body as Partial<ProjectInput>;
  await assertResumeOwnership(resumeId, userId);
  const existing = await prisma.resumeProject.findUnique({ where: { id: projectId } });
  if (!existing || existing.resumeId !== resumeId) throw new AppError("Project not found", 404);
  const project = await prisma.resumeProject.update({ where: { id: projectId }, data });
  res.status(200).json({ success: true, data: project });
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, projectId } = req.params;
  await assertResumeOwnership(resumeId, userId);
  const existing = await prisma.resumeProject.findUnique({ where: { id: projectId } });
  if (!existing || existing.resumeId !== resumeId) throw new AppError("Project not found", 404);
  await prisma.resumeProject.delete({ where: { id: projectId } });
  res.status(200).json({ success: true, message: "Project deleted" });
});

// ── Certifications ──
export const addCertification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as CertificationInput;
  await assertResumeOwnership(resumeId, userId);
  const cert = await prisma.certification.create({ data: { resumeId, ...data } });
  res.status(201).json({ success: true, data: cert });
});

export const deleteCertification = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, certificationId } = req.params;
  await assertResumeOwnership(resumeId, userId);
  const existing = await prisma.certification.findUnique({ where: { id: certificationId } });
  if (!existing || existing.resumeId !== resumeId) throw new AppError("Certification not found", 404);
  await prisma.certification.delete({ where: { id: certificationId } });
  res.status(200).json({ success: true, message: "Certification deleted" });
});

// ── Languages ──
export const addLanguage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;
  const data = req.body as LanguageInput;
  await assertResumeOwnership(resumeId, userId);
  const language = await prisma.language.create({ data: { resumeId, ...data } });
  res.status(201).json({ success: true, data: language });
});

export const deleteLanguage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, languageId } = req.params;
  await assertResumeOwnership(resumeId, userId);
  const existing = await prisma.language.findUnique({ where: { id: languageId } });
  if (!existing || existing.resumeId !== resumeId) throw new AppError("Language not found", 404);
  await prisma.language.delete({ where: { id: languageId } });
  res.status(200).json({ success: true, message: "Language deleted" });
});
