import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";
import { type listBooksQueryType } from "../schemas/query.js";

import { type BookIdSchema, CreateBookSchema } from "../schemas/book.js";

// get all books
export async function getBooks(req: FastifyRequest, reply: FastifyReply) {
  try {
    let queries = req.query as listBooksQueryType;

    // create where command for db execution.
    const where = queries.search
      ? {
          bookName: { contains: queries.search },
        }
      : {};

    const [total, data] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (queries.page - 1) * queries.limit,
        take: queries.limit,
      }),
    ]);

    if (queries.page > (Math.ceil(total / queries.limit) || 1))
      return reply.status(400).send({
        data: {
          success: false,
          message: "Current page can not be greater than total pages",
        },
      });

    return reply.status(200).send({
      data: {
        success: true,
        data,
        meta: {
          page: queries.page,
          limit: queries.limit,
          total,
          totalPages: Math.ceil(total / queries.limit) || 1,
        },

        message: " List of books",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message:
          err?.meta?.driverAdapterError?.cause?.originalMessage ||
          "Something went wrong could not get",
      },
    });
  }
}

// get single book by id
export async function getBookById(req: FastifyRequest, reply: FastifyReply) {
  try {
    let params = req.params as BookIdSchema;
    let book = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });
    return reply.status(200).send({
      data: {
        success: true,
        data: book,
        message: "OK",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message:
          err?.meta?.driverAdapterError?.cause?.originalMessage ||
          "Something went wrong could not get",
      },
    });
  }
}

// add new book
export async function addBook(req: FastifyRequest, reply: FastifyReply) {
  try {
    let bookInfo = req.body as CreateBookSchema;
    let data = await prisma.book.create({
      data: bookInfo,
    });
    req.log.info(
      {
        bookId: data.id,
        authorName: data.authorName,
      },
      "Book created",
    );

    return reply.status(201).send({
      data: {
        success: true,
        data,
        message: "Added Successfully",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message:
          err?.meta?.driverAdapterError?.cause?.originalMessage ||
          "Something went wrong could not add",
      },
    });
  }
}

// edit book by id
export async function editBook(req: FastifyRequest, reply: FastifyReply) {
  try {
    let params = req.params as BookIdSchema;
    let bookInfo = req.body as CreateBookSchema;
    let data = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: bookInfo,
    });

    return reply.status(200).send({
      data: {
        success: true,
        data,
        message: "Edit Successfully",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message:
          err?.meta?.driverAdapterError?.cause?.originalMessage ||
          "Something went wrong could not edit",
      },
    });
  }
}

// delete book by id
export async function deleteBookById(req: FastifyRequest, reply: FastifyReply) {
  try {
    let params = req.params as BookIdSchema;
    let book = await prisma.book.delete({
      where: {
        id: params.id,
      },
    });
    return reply.status(200).send({
      data: {
        success: true,
        data: book,
        message: "Delete successfully",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message:
          err?.meta?.driverAdapterError?.cause?.originalMessage ||
          "Something went wrong could not delete",
      },
    });
  }
}
