import { z } from "zod";

// Everything optional here — this schema is for UPDATING a profile, and a
// user might only want to change one field (e.g. just their bio). Making
// every field optional means we don't force the frontend to resend the
// whole profile just to change one line.
export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(1000).optional(),
  phone: z.string().trim().max(20).optional(),
  location: z.string().trim().max(150).optional(),
  linkedinUrl: z.string().trim().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  githubUrl: z.string().trim().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  portfolioUrl: z.string().trim().url("Must be a valid URL").max(255).optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
