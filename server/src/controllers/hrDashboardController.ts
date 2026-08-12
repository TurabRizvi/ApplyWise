import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

// Everything here is scoped to the requesting HR user's OWN organization —
// never platform-wide. Two different companies using ApplyWise must never
// see each other's screening activity or candidate counts.
export const getHrDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const hrUserId = req.auth!.userId;

  const hrUser = await prisma.hrUser.findUnique({ where: { id: hrUserId } });
  if (!hrUser) throw new AppError("HR account not found", 404);

  const [totalBatches, screenedResumes] = await Promise.all([
    prisma.screeningBatch.count({ where: { organizationId: hrUser.organizationId } }),
    prisma.screenedResume.findMany({
      where: { batch: { organizationId: hrUser.organizationId } },
      select: { atsScore: true },
    }),
  ]);

  const scoredResumes = screenedResumes.filter((r: { atsScore: number | null }) => r.atsScore !== null);
  const averageMatchScore =
    scoredResumes.length > 0
      ? Math.round(
          scoredResumes.reduce((sum: number, r: { atsScore: number | null }) => sum + (r.atsScore ?? 0), 0) /
            scoredResumes.length
        )
      : 0;

  // Real bucket counts, not decorative — this is what powers the score
  // distribution chart on the HR dashboard. Every screened resume with a
  // score falls into exactly one bucket.
  const buckets = { "80-100": 0, "60-80": 0, "40-60": 0, "20-40": 0, "0-20": 0 };
  for (const r of scoredResumes) {
    const score = r.atsScore ?? 0;
    if (score >= 80) buckets["80-100"]++;
    else if (score >= 60) buckets["60-80"]++;
    else if (score >= 40) buckets["40-60"]++;
    else if (score >= 20) buckets["20-40"]++;
    else buckets["0-20"]++;
  }

  res.status(200).json({
    success: true,
    data: {
      totalBatches,
      candidatesScreened: screenedResumes.length,
      averageMatchScore,
      scoreDistribution: buckets,
    },
  });
});
