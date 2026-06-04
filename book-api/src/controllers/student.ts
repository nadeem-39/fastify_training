import { FastifyRequest, FastifyReply } from "fastify";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { pipeline } from "stream/promises";
import { createReadStream, existsSync } from "node:fs";
import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";
import { type paginationQueryType } from "../schemas/query.js";
import {
  CreateStudentSchemaType,
  type StudentIdSchemaType,
} from "../schemas/student.js";
import { type BookIdSchema, CreateBookSchema } from "../schemas/book.js";
import { sendEmail } from "../lib/mailer.js";
import { reqUserSchemaType } from "../schemas/reqUserSchema.js";
import { fileValidation } from "../lib/fileValidation.js";

import { deleteFile } from "../lib/deleteFile.js";

// get all students
export async function getStudents(req: FastifyRequest, reply: FastifyReply) {
  try {
    let queries = req.query as paginationQueryType;

    // create where command for db execution.
    const where = queries.search
      ? {
          name: { contains: queries.search },
          rollNo: { contains: queries.search },
        }
      : {};

    const [total, data] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (queries.page - 1) * queries.limit,
        take: queries.limit,
      }),
    ]);

    return reply.status(200).send({
      success: true,
      data: data || [],
      meta: {
        page: queries.page,
        limit: queries.limit,
        total,
        totalPages: Math.ceil(total / queries.limit) || 1,
      },
      message: " List of students",
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

// get single student by id
export async function getStudentById(req: FastifyRequest, reply: FastifyReply) {
  try {
    let params = req.params as StudentIdSchemaType;
    let student = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
    });
    return reply.status(200).send({
      success: true,
      data: student,
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

// add new student
export async function addStudent(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parts = req.parts();
    const studentInfo: {
      name?: string;
      rollNo?: string;
      phoneNo?: string;
      country?: string;
      state?: string;
      city?: string;
      photo?: string;
    } = {};

    for await (const part of parts) {
      if (part.type === "field") {
        switch (part.fieldname) {
          case "name":
            studentInfo.name = part.value as string;
            break;

          case "rollNo":
            studentInfo.rollNo = part.value as string;
            break;

          case "phoneNo":
            studentInfo.phoneNo = part.value as string;
            break;
          case "country":
            studentInfo.country = part.value as string;
            break;
          case "state":
            studentInfo.state = part.value as string;
            break;
          case "city":
            studentInfo.city = part.value as string;
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

        const relativePath = `uploads/students/${fileName}`;

        await pipeline(part.file, fs.createWriteStream(relativePath));

        studentInfo.photo = fileName;
      }
    }
    let studentData = studentInfo as CreateStudentSchemaType;

    let data = await prisma.student.create({
      data: studentData,
    });

    return reply.status(201).send({
      success: true,
      data,
      message: "Added Successfully",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not add",
    });
  }
}

// edit book by id
export async function editBook(req: FastifyRequest, reply: FastifyReply) {
  try {
    const parts = req.parts();

    const studentInfo: {
      bookName?: string;
      authorName?: string;
      isbn?: string;
      coverFile?: string;
    } = {};

    for await (const part of parts) {
      if (part.type === "field") {
        switch (part.fieldname) {
          case "bookName":
            studentInfo.bookName = part.value as string;
            break;

          case "authorName":
            studentInfo.authorName = part.value as string;
            break;

          case "isbn":
            studentInfo.isbn = part.value as string;
            break;
        }
      }

      if (part.type === "file") {
        if (!fileValidation(part))
          return reply
            .code(400)
            .send({ success: false, message: "Invalid file (jpeg/png only)" });
        const ext = path.extname(part.filename ?? "");

        const fileName = `${uuidv4()}${ext}`;

        const relativePath = `uploads/books/${fileName}`;

        await pipeline(part.file, fs.createWriteStream(relativePath));

        studentInfo.coverFile = fileName;
      }
    }
    let content = `
      Book Name: ${studentInfo.bookName}
      Author: ${studentInfo.authorName}
      ISBN: ${studentInfo.isbn}
      `;
    let user = req.user as reqUserSchemaType;
    await sendEmail(user.email, "Successfully book edited", content);
    // console.log(req.user, " --------------------------------------------");

    let params = req.params as BookIdSchema;
    let bookData = studentInfo as CreateBookSchema;
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

    return reply.status(200).send({
      success: true,
      data,
      message: "Edit Successfully",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    console.log(error);

    return reply.status(400).send({
      success: false,
      message:
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
