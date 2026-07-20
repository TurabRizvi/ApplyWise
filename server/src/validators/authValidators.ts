import { z } from "zod";

// Every field is validated BEFORE it reaches a controller or the database.
// This is the primary defense against injection-style and malformed-data
// bugs — Prisma's parameterized queries already prevent SQL injection, but
// strict input validation is still what stops garbage data, oversized
// payloads, and logic errors from ever reaching business logic.

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be under 72 characters") // bcrypt's hard limit
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerCandidateSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  password: passwordSchema,
  fullName: z.string().trim().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerHrSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address").max(255),
  password: passwordSchema,
  organizationName: z.string().trim().min(2).max(150),
});

export type RegisterCandidateInput = z.infer<typeof registerCandidateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterHrInput = z.infer<typeof registerHrSchema>;
