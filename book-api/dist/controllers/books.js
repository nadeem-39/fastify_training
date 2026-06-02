import { getBook, listBooks, createBook, updateBook, deleteBook, } from "../services/bookStore.js";
// get all books
export async function getBooks(req, reply) {
    let books = listBooks();
    return reply.status(200).send({
        data: {
            success: true,
            data: books,
            message: " List of book",
        },
    });
}
// get single book by id
export async function getBookById(req, reply) {
    let params = req.params;
    let book = getBook(params.id);
    return reply.status(200).send({
        data: {
            success: true,
            data: book || null,
            message: "Filtered Successfully",
        },
    });
}
// add new book
export async function addBook(req, reply) {
    let bookInfo = req.body;
    let data = createBook(bookInfo);
    req.log.info({
        bookId: data.id,
        authorName: data.authorName,
    }, "book created");
    return reply.status(201).send({
        data: {
            success: true,
            data,
            message: "Added Successfully",
        },
    });
}
// edit book by id
export async function editBook(req, reply) {
    let params = req.params;
    let bookInfo = req.body;
    let data = updateBook(params.id, bookInfo);
    return reply.status(200).send({
        data: {
            success: true,
            data,
            message: "Edited Successfully",
        },
    });
}
// delete book by id
export async function deleteBookById(req, reply) {
    let params = req.params;
    let book = deleteBook(params.id);
    return reply.status(200).send({
        success: true,
        message: "Deleted Successfully",
    });
}
