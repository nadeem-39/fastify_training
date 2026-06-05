import z from "zod";
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

export const paginationQueryForIssue = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["ALL", "ISSUED", "RETURNED"]).default("ALL"),
});

export type paginationQueryType = z.infer<typeof paginationQuery>;
export type paginationQueryForIssueType = z.infer<
  typeof paginationQueryForIssue
>;
