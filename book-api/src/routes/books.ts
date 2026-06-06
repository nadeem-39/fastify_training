import type { FastifyPluginAsync } from "fastify";
import { bookIdSchema, createBookSchema } from "../schemas/book.js";
import { paginationQuery } from "../schemas/query.js";

import {
  getBooks,
  getBookById,
  addBook,
  editBook,
  deleteBookById,
  getBookImage,
  exportBooksExel,
  exportBooksCsv,
  exportBookPdf,
  addBookBulk,
} from "../controllers/books.js";
import { authorize } from "../lib/authorization.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const booksRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: { querystring: paginationQuery },
    },
    getBooks,
  );
  server.get(
    "/export.xlsx",
    {
      preHandler: [server.authenticate],
      schema: { querystring: paginationQuery },
    },
    exportBooksExel,
  );
  server.get(
    "/export.csv",
    {
      preHandler: [server.authenticate],
      schema: { querystring: paginationQuery },
    },
    exportBooksCsv,
  );
  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    getBookById,
  );
  server.get(
    "/:id/details.pdf",
    {
      preHandler: [server.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    exportBookPdf,
  );
  server.get(
    "/:id/cover",
    {
      schema: {
        preHandler: [server.authenticate],
        params: bookIdSchema,
      },
    },
    getBookImage,
  );
  server.post(
    "/",
    {
      preHandler: [server.authenticate, authorize],
    },
    addBook,
  );
  server.put(
    "/:id",
    {
      preHandler: [server.authenticate, authorize],
      schema: {
        params: bookIdSchema,
      },
    },
    editBook,
  );
  server.delete(
    "/:id",
    {
      preHandler: [server.authenticate, authorize],
      schema: {
        params: bookIdSchema,
      },
    },
    deleteBookById,
  );
  server.post(
    "/bulk",
    {
      preHandler: [server.authenticate],
    },
    addBookBulk,
  );
};
