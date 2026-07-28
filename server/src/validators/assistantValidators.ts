import { z } from "zod";

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().max(2000),
});

export const assistantMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000),
  history: z.array(historyMessageSchema).max(20).optional().default([]),
});

export type AssistantMessageInput = z.infer<typeof assistantMessageSchema>;
