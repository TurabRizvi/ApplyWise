import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// One aggregated endpoint rather than making the frontend fire 5 separate
// requests on page load — fewer round trips, and all the counts are
// computed with lightweight `count()` queries, not by loading full rows.
export const getCandidateDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const [resumeCount, applicationsSent, interviewsScheduled, offers, rejections] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.jobApplication.count({ where: { userId, status: { not: "WISHLIST" } } }),
    prisma.jobApplication.count({ where: { userId, status: "INTERVIEW" } }),
    prisma.jobApplication.count({ where: { userId, status: { in: ["OFFER", "ACCEPTED"] } } }),
    prisma.jobApplication.count({ where: { userId, status: "REJECTED" } }),
  ]);

  res.status(200).json({
    success: true,
    data: { resumeCount, applicationsSent, interviewsScheduled, offers, rejections },
  });
});
