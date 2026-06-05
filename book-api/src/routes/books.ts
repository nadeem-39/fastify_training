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

export const booksRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQuery },
    },
    getBooks,
  );
  app.get(
    "/export.xlsx",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQuery },
    },
    exportBooksExel,
  );
  app.get(
    "/export.csv",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQuery },
    },
    exportBooksCsv,
  );
  app.get(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    getBookById,
  );
  app.get(
    "/:id/details.pdf",
    {
      preHandler: [app.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    exportBookPdf,
  );
  app.get(
    "/:id/cover",
    {
      schema: {
        preHandler: [app.authenticate],
        params: bookIdSchema,
      },
    },
    getBookImage,
  );
  app.post(
    "/",
    {
      preHandler: [app.authenticate, authorize],
    },
    addBook,
  );
  app.put(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    editBook,
  );
  app.delete(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: bookIdSchema,
      },
    },
    deleteBookById,
  );
  app.post(
    "/bulk",
    {
      preHandler: [app.authenticate],
    },
    addBookBulk,
  );
};
