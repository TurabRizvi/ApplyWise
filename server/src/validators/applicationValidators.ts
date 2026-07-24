import { z } from "zod";

const statusEnum = z.enum([
  "WISHLIST",
  "APPLIED",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
]);

export const createApplicationSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  position: z.string().trim().min(1).max(200),
  jobUrl: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional(),
  salary: z.string().trim().max(100).optional(),
  status: statusEnum.default("WISHLIST"),
  notes: z.string().trim().max(2000).optional(),
  dateApplied: z.coerce.date().optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

// Query params come in as strings from the URL — z.coerce / enum handles
// validation so a bad `?status=` value gets rejected instead of silently
// producing an empty or wrong result set.
export const applicationQuerySchema = z.object({
  status: statusEnum.optional(),
  search: z.string().trim().max(200).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;
