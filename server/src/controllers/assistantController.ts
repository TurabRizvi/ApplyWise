import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { getAssistantReply } from "../services/assistantService";
import { AssistantMessageInput } from "../validators/assistantValidators";

export const chatWithAssistant = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const { message, history } = req.body as AssistantMessageInput;

  const reply = await getAssistantReply(message, history);

  // Logged like every other AI feature — lets us review later whether the
  // assistant is staying on-topic and answering well.
  await prisma.aiHistory.create({
    data: {
      userId,
      featureType: "ASSISTANT",
      inputSummary: message.slice(0, 500),
      outputSummary: reply.slice(0, 2000),
    },
  });

  res.status(200).json({ success: true, data: { reply } });
});
