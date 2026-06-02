import type { FastifyPluginAsync } from "fastify";
import { bookIdSchema, createBookSchema } from "../schemas/book.js";
import { listBooksQuery } from "../schemas/query.js";
import {
  getBooks,
  getBookById,
  addBook,
  editBook,
  deleteBookById,
} from "../controllers/books.js";

export const booksRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    { preHandler: [app.authenticate], schema: { querystring: listBooksQuery } },
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
  app.post(
    "/",
    {
      preHandler: [app.authenticate],
      schema: {
        body: createBookSchema,
      },
    },
    addBook,
  );
  app.put(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: bookIdSchema,
        body: createBookSchema,
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
