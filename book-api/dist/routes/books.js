import { bookIdSchema, createBookSchema } from "../schemas/book.js";
import { getBooks, getBookById, addBook, editBook, deleteBookById, } from "../controllers/books.js";
export const booksRoutes = async (app) => {
    app.get("/", getBooks);
    app.get("/:id", {
        schema: {
            params: bookIdSchema,
        },
    }, getBookById);
    app.post("/", {
        schema: {
            body: createBookSchema,
        },
    }, addBook);
    app.put("/:id", {
        schema: {
            params: bookIdSchema,
            body: createBookSchema,
        },
    }, editBook);
    app.delete("/:id", {
        schema: {
            params: bookIdSchema,
        },
    }, deleteBookById);
};
