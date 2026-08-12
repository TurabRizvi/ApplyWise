import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { getAssistantReply, type AssistantAudience } from "../services/assistantService";
import { AssistantMessageInput } from "../validators/assistantValidators";

export const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const accountType = req.auth!.accountType; // "USER" (candidate) | "HR"
  const { message, history } = req.body as AssistantMessageInput;

  const audience: AssistantAudience = accountType === "HR" ? "HR" : "CANDIDATE";
  const reply = await getAssistantReply(message, history, audience);

  // Candidate and HR conversations are logged to SEPARATE tables
  // (AiHistory vs HrAiHistory) because AiHistory.userId has a foreign key
  // to the candidate User table specifically — an HrUser's id would
  // violate that constraint. Two tables, same purpose: being able to
  // review what the assistant said later if something looks off.
  if (accountType === "USER") {
    await prisma.aiHistory.create({
      data: {
        userId,
        featureType: "ASSISTANT",
        inputSummary: message.slice(0, 500),
        outputSummary: reply.slice(0, 2000),
      },
    });
  } else {
    await prisma.hrAiHistory.create({
      data: {
        hrUserId: userId,
        featureType: "ASSISTANT",
        inputSummary: message.slice(0, 500),
        outputSummary: reply.slice(0, 2000),
      },
    });
  }

  res.status(200).json({ success: true, data: { reply } });
});
