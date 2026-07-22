import { z } from "zod";

export const createResumeSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
});

export const updateResumeSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
});

// Dates come in as ISO strings from the frontend and get coerced to Date
// objects here — this is the one place that conversion happens, so every
// controller downstream just deals with real Date objects, not strings.
export const educationSchema = z.object({
  institution: z.string().trim().min(1).max(200),
  degree: z.string().trim().min(1).max(200),
  fieldOfStudy: z.string().trim().max(200).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  description: z.string().trim().max(1000).optional(),
});

export const experienceSchema = z.object({
  company: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(200),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(1000).optional(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
