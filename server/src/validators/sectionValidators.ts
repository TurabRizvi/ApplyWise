import { z } from "zod";

export const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  techStack: z.string().trim().max(300).optional(),
  projectUrl: z.string().trim().url("Must be a valid URL").max(255).optional().or(z.literal("")),
});

export const certificationSchema = z.object({
  name: z.string().trim().min(1).max(200),
  issuer: z.string().trim().max(200).optional(),
  issueDate: z.coerce.date().optional(),
});

export const languageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  proficiency: z.string().trim().max(50).optional(),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificationInput = z.infer<typeof certificationSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
