import { z } from "zod";

export const bookIdSchema = z.object({
  id: z.coerce
    .number({ error: "Invalid book Id" })
    .int({ error: "Book id should be Integer" })
    .positive({ error: "Book id can not be negative" }),
});

export const createBookSchema = z.object({
  bookName: z
    .string()
    .min(1, "Book name is empty")
    .max(100, "Book name should be less than 100 characters"),
  authorName: z
    .string()
    .min(1, "Author name is empty")
    .max(100, "Author name should be less than 100 characters"),
  isbn: z.string().regex(/^[0-9]{10}([0-9]{3})?$/, "Wrong ISBN"),
});

export type BookIdSchema = z.infer<typeof bookIdSchema>;
export type CreateBookSchema = z.infer<typeof createBookSchema>;
