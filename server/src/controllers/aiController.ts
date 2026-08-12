import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertResumeOwnership } from "../utils/resumeOwnership";
import {
  analyzeResumeATS,
  rewriteResumeATS,
  generateInterviewPrep,
  generateCoverLetter,
} from "../services/aiService";
import { CoverLetterInput } from "../validators/aiValidators";

// Every AI feature needs the resume's extracted text. This helper fetches
// it AND confirms ownership in one place, so no AI route can be pointed at
// someone else's resume.
async function getOwnedResumeText(resumeId: string, userId: string): Promise<string> {
  await assertResumeOwnership(resumeId, userId);
  const resume = await prisma.resume.findUnique({ where: { id: resumeId } });

  if (!resume?.extractedText) {
    throw new AppError(
      "This resume has no readable text yet. Upload a PDF or fill in the resume builder sections first.",
      400
    );
  }
  return resume.extractedText;
}

export const atsAnalyze = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;

  const text = await getOwnedResumeText(resumeId, userId);
  const result = await analyzeResumeATS(text);

  // Every AI call is logged — this is what lets us debug a bad AI output
  // later without guessing what was sent in.
  await prisma.aiHistory.create({
    data: {
      userId,
      resumeId,
      featureType: "ATS_ANALYSIS",
      inputSummary: text.slice(0, 500),
      outputSummary: JSON.stringify(result).slice(0, 2000),
    },
  });

  res.status(200).json({ success: true, data: result });
});

export const atsRewrite = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;

  const text = await getOwnedResumeText(resumeId, userId);
  const result = await rewriteResumeATS(text);

  await prisma.aiHistory.create({
    data: {
      userId,
      resumeId,
      featureType: "ATS_REWRITE",
      inputSummary: text.slice(0, 500),
      outputSummary: result.rewrittenResume.slice(0, 2000),
    },
  });

  res.status(200).json({ success: true, data: result });
});

export const interviewPrep = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId } = req.params;

  const text = await getOwnedResumeText(resumeId, userId);
  const result = await generateInterviewPrep(text);

  await prisma.aiHistory.create({
    data: {
      userId,
      resumeId,
      featureType: "INTERVIEW_PREP",
      inputSummary: text.slice(0, 500),
      outputSummary: JSON.stringify(result).slice(0, 2000),
    },
  });

  res.status(200).json({ success: true, data: result });
});

export const coverLetterGenerate = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { resumeId, companyName, jobTitle, jobDescription } = req.body as CoverLetterInput;

  const text = await getOwnedResumeText(resumeId, userId);
  const result = await generateCoverLetter(text, companyName, jobTitle, jobDescription);

  const coverLetter = await prisma.coverLetter.create({
    data: { userId, companyName, jobTitle, content: result.content },
  });

  await prisma.aiHistory.create({
    data: {
      userId,
      resumeId,
      featureType: "COVER_LETTER",
      inputSummary: `${companyName} / ${jobTitle}`,
      outputSummary: result.content.slice(0, 2000),
    },
  });

  res.status(201).json({ success: true, data: coverLetter });
});

export const listCoverLetters = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const coverLetters = await prisma.coverLetter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ success: true, data: coverLetters });
});
