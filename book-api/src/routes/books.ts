import type { FastifyPluginAsync } from "fastify";
import { bookIdSchema, createBookSchema } from "../schemas/book.js";
import { paginationQuery } from "../schemas/query.js";
import { bodyParser } from "../lib/bodyParser.js";
import {
  getBooks,
  getBookById,
  addBook,
  editBook,
  deleteBookById,
  getBookImage,
} from "../controllers/books.js";

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
    "/:id/cover",
    {
      schema: {
        params: bookIdSchema,
      },
    },
    getBookImage,
  );
  app.post(
    "/",
    {
      preHandler: [app.authenticate],
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
};
