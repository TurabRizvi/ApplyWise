import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { assertBatchOwnership } from "../utils/hrOwnership";
import { extractTextFromPdf } from "../utils/pdfParser";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload";
import { scoreResumeAgainstJob } from "../services/aiService";
import { CreateBatchInput, CompareResumesInput } from "../validators/screeningValidators";
import { logger } from "../utils/logger";

export const createBatch = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;
  const { jobTitle, jobDescription } = req.body as CreateBatchInput;

  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) throw new AppError("HR account not found", 404);

  const batch = await prisma.screeningBatch.create({
    data: { organizationId: hrUser.organizationId, jobTitle, jobDescription },
  });

  res.status(201).json({ success: true, data: batch });
});

export const listBatches = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;
  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) throw new AppError("HR account not found", 404);

  const batches = await prisma.screeningBatch.findMany({
    where: { organizationId: hrUser.organizationId },
    select: {
      id: true,
      jobTitle: true,
      createdAt: true,
      _count: { select: { candidates: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, data: batches });
});

// Returns the batch WITH every screened resume, ranked highest-score-first
// — this is the "AI ranks every applicant" feature from the proposal.
export const getBatchWithRankedResumes = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;
  const { batchId } = req.params;

  const { batch } = await assertBatchOwnership(batchId, hrUserId);

  const candidates = await prisma.screenedResume.findMany({
    where: { batchId },
    orderBy: { atsScore: "desc" },
  });

  res.status(200).json({ success: true, data: { batch, candidates } });
});

// Bulk upload + score: each file is processed independently, and one bad
// file (corrupt PDF, unreadable scan) does NOT fail the whole batch — we
// collect per-file results so the recruiter sees exactly which ones
// succeeded and which didn't, instead of an all-or-nothing failure.
export const bulkUploadAndScore = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;
  const { batchId } = req.params;

  const { batch } = await assertBatchOwnership(batchId, hrUserId);

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    throw new AppError("No files uploaded. Field name must be 'resumes'.", 400);
  }

  const results: { fileName: string; success: boolean; error?: string }[] = [];

  for (const file of files) {
    try {
      const extractedText = await extractTextFromPdf(file.buffer);
      const fileUrl = await uploadBufferToCloudinary(file.buffer, `applywise/screening/${batchId}`);
      const scoring = await scoreResumeAgainstJob(extractedText, batch.jobDescription);

      await prisma.screenedResume.create({
        data: {
          batchId,
          fileUrl,
          extractedText,
          candidateName: file.originalname.replace(/\.pdf$/i, ""),
          atsScore: scoring.atsScore,
          matchedSkills: JSON.stringify(scoring.matchedSkills),
          gaps: JSON.stringify(scoring.gaps),
          aiRawResponse: JSON.stringify(scoring),
        },
      });

      results.push({ fileName: file.originalname, success: true });
    } catch (err) {
      // Log the real error server-side, but keep processing the rest of
      // the batch — one bad file shouldn't block 19 good ones.
      logger.error("Failed to process resume in batch", {
        batchId,
        fileName: file.originalname,
        error: err instanceof Error ? err.message : String(err),
      });
      results.push({
        fileName: file.originalname,
        success: false,
        error: "Could not process this file",
      });
    }
  }

  res.status(201).json({ success: true, data: { results } });
});

export const compareCandidates = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;
  const { batchId } = req.params;
  const { resumeIds } = req.body as CompareResumesInput;

  await assertBatchOwnership(batchId, hrUserId);

  const candidates = await prisma.screenedResume.findMany({
    where: { id: { in: resumeIds }, batchId }, // scoped to THIS batch only
    orderBy: { atsScore: "desc" },
  });

  res.status(200).json({ success: true, data: candidates });
});
