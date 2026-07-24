import { z } from "zod";

export const createBatchSchema = z.object({
  jobTitle: z.string().trim().min(1).max(200),
  jobDescription: z.string().trim().min(20, "Job description is too short").max(10000),
});

export const compareResumesSchema = z.object({
  resumeIds: z
    .array(z.string().uuid())
    .min(2, "Select at least 2 candidates to compare")
    .max(10, "You can compare up to 10 candidates at a time"),
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type CompareResumesInput = z.infer<typeof compareResumesSchema>;
