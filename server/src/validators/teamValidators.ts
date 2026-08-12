import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(72, "Under 72 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

export const addTeamMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: passwordSchema,
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
