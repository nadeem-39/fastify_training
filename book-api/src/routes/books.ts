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
  app.get("/", { schema: { querystring: listBooksQuery } }, getBooks);
  app.get(
    "/:id",
    {
      schema: {
        params: bookIdSchema,
      },
    },
    getBookById,
  );
  app.post(
    "/",
    {
      schema: {
        body: createBookSchema,
      },
    },
    addBook,
  );
  app.put(
    "/:id",
    {
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
      schema: {
        params: bookIdSchema,
      },
    },
    deleteBookById,
  );
};
