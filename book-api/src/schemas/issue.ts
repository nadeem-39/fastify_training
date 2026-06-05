import { z } from "zod";
export const createIssueSchema = z.object({
  bookId: z
    .number("Book id is empty")
    .int("Book id should be integer")
    .positive("Book id should be positive"),
  studentId: z
    .number("Student is empty")
    .int("Book id should be integer")
    .positive("Book id should be integer"),
  issueDate: z.coerce.date("Date is empty"),
});

export const issueIdSchema = z.object({
  id: z.coerce
    .number({ error: "Invalid issue id" })
    .int({ error: "Issue id should be Integer" })
    .positive({ error: "Issue id can not be negative" }),
});

export type CreateIssueSchemaType = z.infer<typeof createIssueSchema>;
export type issueIdSchemaType = z.infer<typeof issueIdSchema>;
