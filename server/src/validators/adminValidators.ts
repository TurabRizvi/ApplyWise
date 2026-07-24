import { z } from "zod";

// Pagination is mandatory-with-defaults, not optional-unbounded — without
// a cap, an admin route could be used to dump an entire table in one
// request as data grows.
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export const setActiveStatusSchema = z.object({
  isActive: z.boolean(),
});
