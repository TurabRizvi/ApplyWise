import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";

// Parses the overallScore back out of the most recent ATS_ANALYSIS log
// entry. This is a bit indirect — the score isn't stored as its own column
// anywhere, only inside AiHistory's outputSummary (a JSON string snapshot
// of what the AI returned at the time). Since overallScore is always the
// first field in that JSON, it survives the 2000-char truncation applied
// when the log entry was created, so this is reliable in practice.
async function getLatestAtsScore(userId: string) {
  const latest = await prisma.aiHistory.findFirst({
    where: { userId, featureType: "ATS_ANALYSIS" },
    orderBy: { createdAt: "desc" },
  });

  if (!latest) return null;

  try {
    const parsed = JSON.parse(latest.outputSummary);
    return {
      overallScore: parsed.overallScore ?? null,
      formattingScore: parsed.formattingScore ?? null,
      keywordScore: parsed.keywordScore ?? null,
      grammarScore: parsed.grammarScore ?? null,
      actionVerbScore: parsed.actionVerbScore ?? null,
      analyzedAt: latest.createdAt,
    };
  } catch {
    // If outputSummary got truncated mid-JSON (a very long AI response),
    // this just quietly returns null rather than crashing the dashboard.
    return null;
  }
}

const FEATURE_LABELS: Record<string, string> = {
  ATS_ANALYSIS: "ATS analysis completed",
  ATS_REWRITE: "AI rewrite completed",
  INTERVIEW_PREP: "Interview questions generated",
  COVER_LETTER: "Cover letter generated",
  ASSISTANT: "Asked the AI Assistant a question",
};

export const getCandidateDashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;

  const [resumeCount, applicationsSent, interviewsScheduled, offers, rejections, latestScore, recentHistory] =
    await Promise.all([
      prisma.resume.count({ where: { userId } }),
      prisma.jobApplication.count({ where: { userId, status: { not: "WISHLIST" } } }),
      prisma.jobApplication.count({ where: { userId, status: "INTERVIEW" } }),
      prisma.jobApplication.count({ where: { userId, status: { in: ["OFFER", "ACCEPTED"] } } }),
      prisma.jobApplication.count({ where: { userId, status: "REJECTED" } }),
      getLatestAtsScore(userId),
      prisma.aiHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { featureType: true, createdAt: true },
      }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      resumeCount,
      applicationsSent,
      interviewsScheduled,
      offers,
      rejections,
      latestScore,
      recentActivity: recentHistory.map((h: { featureType: string; createdAt: Date }) => ({
        label: FEATURE_LABELS[h.featureType] ?? h.featureType,
        createdAt: h.createdAt,
      })),
    },
  });
});
