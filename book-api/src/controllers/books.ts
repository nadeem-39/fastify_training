import { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream/promises";
import { createReadStream, existsSync } from "node:fs";
import Papa from "papaparse";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";
import { type paginationQueryType } from "../schemas/query.js";
import ExcelJS from "exceljs";
import { type BookIdSchema, createBookSchema } from "../schemas/book.js";
import { sendEmail } from "../lib/mailer.js";
import { reqUserSchemaType } from "../schemas/reqUserSchema.js";
import { fileValidation } from "../lib/fileValidation.js";

import { deleteFile } from "../lib/deleteFile.js";
import { ZodError } from "zod";
import { klaviyo } from "../lib/klaviyo.js";

// get all books
export async function getBooks(req: FastifyRequest, reply: FastifyReply) {
  try {
    let queries = req.query as paginationQueryType;

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
        success: false,
        message: "Current page can not be greater than total pages",
      });

    return reply.status(200).send({
      success: true,
      data: data || [],
      meta: {
        page: queries.page,
        limit: queries.limit,
        total,
        totalPages: Math.ceil(total / queries.limit) || 1,
      },
      message: " List of books",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not get",
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
      success: true,
      data: book,
      message: "OK",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not get",
    });
  }
}

// add new book
export async function addBook(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parts = req.parts();
    const bookInfo: {
      bookName?: string;
      authorName?: string;
      isbn?: string;
      coverFile?: string;
    } = {};

    for await (const part of parts) {
      if (part.type === "field") {
        switch (part.fieldname) {
          case "bookName":
            bookInfo.bookName = part.value as string;
            break;

          case "authorName":
            bookInfo.authorName = part.value as string;
            break;

          case "isbn":
            bookInfo.isbn = part.value as string;
            break;
        }
      }

      if (part.type === "file") {
        if (!fileValidation(part))
          return reply.code(400).send({
            success: false,
            message: "Invalid file (jpg/jpeg/png only)",
          });
        const ext = path.extname(part.filename ?? "");

        const fileName = `${uuidv4()}${ext}`;

        const relativePath = `uploads/books/${fileName}`;

        await pipeline(part.file, fs.createWriteStream(relativePath));

        bookInfo.coverFile = fileName;
      }
    }

    const bookData = createBookSchema.parse(bookInfo);

    let content = `
      Book Name: ${bookInfo.bookName}
      Author: ${bookInfo.authorName}
      ISBN: ${bookInfo.isbn}
      `;
    let user = req.user as reqUserSchemaType;

    let admin = await prisma.user.findUnique({
      where: { email: user.email },
      select: { firstName: true, lastName: true },
    });

    await klaviyo(admin, bookData);

    let data = await prisma.book.create({
      data: bookData,
    });
    req.log.info(
      {
        bookId: data.id,
        authorName: data.authorName,
      },
      "Book created",
    );
    await sendEmail(user.email, "Successfully book added", content);
    return reply.status(201).send({
      success: true,
      data,
      message: "Added Successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }

    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err.message ||
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not add",
    });
  }
}

// edit book by id
export async function editBook(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parts = req.parts();

    const bookInfo: {
      bookName?: string;
      authorName?: string;
      isbn?: string;
      coverFile?: string;
    } = {};

    for await (const part of parts) {
      if (part.type === "field") {
        switch (part.fieldname) {
          case "bookName":
            bookInfo.bookName = part.value as string;
            break;

          case "authorName":
            bookInfo.authorName = part.value as string;
            break;

          case "isbn":
            bookInfo.isbn = part.value as string;
            break;
        }
      }

      if (part.type === "file") {
        if (!fileValidation(part))
          return reply.code(400).send({
            success: false,
            message: "Invalid file (jpg/jpeg/png only)",
          });
        const ext = path.extname(part.filename ?? "");

        const fileName = `${uuidv4()}${ext}`;

        const relativePath = `uploads/books/${fileName}`;

        await pipeline(part.file, fs.createWriteStream(relativePath));

        bookInfo.coverFile = fileName;
      }
    }

    let params = req.params as BookIdSchema;
    const bookData = createBookSchema.parse(bookInfo);
    let content = `
      Book Name: ${bookInfo.bookName}
      Author: ${bookInfo.authorName}
      ISBN: ${bookInfo.isbn}
      `;

    let user = req.user as reqUserSchemaType;

    let admin = await prisma.user.findUnique({
      where: { email: user.email },
      select: { firstName: true, lastName: true, email: true },
    });
    await klaviyo(admin, bookData);

    let oldBookData = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });
    if (oldBookData && oldBookData.coverFile)
      deleteFile(`uploads/books/${oldBookData?.coverFile}`);

    let data = await prisma.book.update({
      where: {
        id: params.id,
      },
      data: bookData,
    });
    await sendEmail(user.email, "Successfully book edited", content);
    return reply.status(200).send({
      success: true,
      data,
      message: "Edit Successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;
    // console.log(error);
    return reply.status(400).send({
      success: false,
      message:
        err.message ||
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not edit",
    });
  }
}

// delete book by id
export async function deleteBookById(req: FastifyRequest, reply: FastifyReply) {
  try {
    let params = req.params as BookIdSchema;
    let oldBookData = await prisma.book.findUnique({
      where: {
        id: params.id,
      },
    });

    if (oldBookData && oldBookData.coverFile)
      deleteFile(`uploads/books/${oldBookData?.coverFile}`);

    let book = await prisma.book.delete({
      where: {
        id: params.id,
      },
    });
    return reply.status(200).send({
      success: true,
      data: book,
      message: "Delete successfully",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not delete",
    });
  }
}

// download file
export async function getBookImage(req: FastifyRequest, reply: FastifyReply) {
  let params = req.params as BookIdSchema;
  const book = await prisma.book.findUnique({
    where: { id: params.id },
  });
  if (!book?.coverFile)
    return reply.code(404).send({ success: false, message: "Not found" });
  const abs = `uploads/books/${book.coverFile}`;

  if (!existsSync(abs))
    return reply.code(404).send({ success: false, message: "Missing" });

  const safeName = `${book.bookName.replace(/[^\w.-]/g, "_")}${path.extname(abs)}`;

  reply.header("Content-Disposition", `attachment; filename="${safeName}"`);
  return reply.send(createReadStream(abs));
}

// export book excel file.

export const exportBooksExel = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    let queries = req.query as paginationQueryType;

    // create where command for db execution.
    const where = queries.search
      ? {
          bookName: { contains: queries.search },
        }
      : {};
    const books = await prisma.book.findMany({
      where,
      select: {
        id: true,
        bookName: true,
        authorName: true,
        isbn: true,
      },
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Books");
    ws.columns = [
      { header: "Id", key: "id", width: 8 },
      { header: "Name", key: "bookName", width: 30 },
      { header: "Author", key: "authorName", width: 25 },
      { header: "ISBN", key: "isbn", width: 14 },
    ];
    ws.addRows(books);

    const buffer = await wb.xlsx.writeBuffer();

    return reply
      .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .header("Content-Disposition", 'attachment; filename="books.xlsx"')
      .send(buffer);
  } catch (error: unknown) {
    console.log(error);

    const err = error as dbErrorType;

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not get",
    });
  }
};

// export book csv file
export const exportBooksCsv = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const queries = req.query as paginationQueryType;

    // Create where condition for search
    const where = queries.search
      ? {
          bookName: {
            contains: queries.search,
          },
        }
      : {};

    const books = await prisma.book.findMany({
      where,
      select: {
        id: true,
        bookName: true,
        authorName: true,
        isbn: true,
      },
    });

    // Convert JSON to CSV
    const csv = "\uFEFF" + Papa.unparse(books);

    return reply
      .type("text/csv; charset=utf-8")
      .header("Content-Disposition", 'attachment; filename="books.csv"')
      .send(csv);
  } catch (error: unknown) {
    console.log(error);

    const err = error as dbErrorType;

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not export books",
    });
  }
};

// eport book pdf file
export const exportBookPdf = async (
  req: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { id } = req.params as BookIdSchema;

    const book = await prisma.book.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!book) {
      return reply.status(404).send({
        success: false,
        message: "Book not found",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", (error) => {
        reject(error);
      });
    });

    // PDF Content
    doc.fontSize(22).text(book.bookName, {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`Author: ${book.authorName}`);
    doc.text(`ISBN: ${book.isbn}`);
    doc.text(`Created Date: ${book.createdAt.toLocaleDateString()}`);

    doc.moveDown(2);
    if (book.coverFile) {
      doc.image(`uploads/books/${book.coverFile}`, 197, 180, {
        width: 200,
        height: 200,
      });
    }

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    return reply
      .type("application/pdf")
      .header(
        "Content-Disposition",
        `attachment; filename="book-${book.id}.pdf"`,
      )
      .send(pdfBuffer);
  } catch (error: unknown) {
    console.log(error);

    const err = error as dbErrorType;

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not export PDF",
    });
  }
};

// book bulk add

export const addBookBulk = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const part = await req.file();
    if (!part) return reply.code(400).send({ message: "No file" });

    const text = (await part.toBuffer()).toString("utf8");
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

    const failed: { row: number; errors: string[] }[] = [];
    const valid: any[] = [];

    parsed.data.forEach((raw, i) => {
      const result = createBookSchema.safeParse(raw);
      if (!result.success) {
        failed.push({
          row: i + 2, // +2 because row 1 is header
          errors: result.error.issues.map((iss) => iss.message),
        });
      } else {
        valid.push(result.data);
      }
    });

    const created = await prisma.book.createMany({
      data: valid,
      skipDuplicates: true,
    });
    return reply.status(400).send({
      success: true,
      data: { created: created.count, failed },
      message: "Ok",
    });
  } catch (error: unknown) {
    console.log(error);

    const err = error as dbErrorType;

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not export PDF",
    });
  }
};
