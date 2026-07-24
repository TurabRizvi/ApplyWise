import { z } from "zod";

export const coverLetterSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
  companyName: z.string().trim().min(1).max(200),
  jobTitle: z.string().trim().min(1).max(200),
  jobDescription: z.string().trim().min(20, "Job description is too short").max(10000),
});

export const resumeIdParamSchema = z.object({
  resumeId: z.string().uuid("Invalid resume ID"),
});

export type CoverLetterInput = z.infer<typeof coverLetterSchema>;
