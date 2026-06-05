import { FastifyRequest, FastifyReply } from "fastify";

import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";

import { paginationQueryForIssueType } from "../schemas/query.js";

import { CreateIssueSchemaType, issueIdSchemaType } from "../schemas/issue.js";
import { ZodError } from "zod";

export const getIssues = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    let queries = req.query as paginationQueryForIssueType;

    const where =
      queries.status === "ALL"
        ? {}
        : {
            status: queries.status,
          };

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip: (queries.page - 1) * queries.limit,
        take: queries.limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          book: {
            select: {
              id: true,
              bookName: true,
              authorName: true,
              isbn: true,
            },
          },
          student: {
            select: {
              id: true,
              name: true,
              rollNo: true,
              phoneNo: true,
            },
          },
        },
      }),
      prisma.issue.count({ where }),
    ]);
    return reply.status(200).send({
      success: true,
      data: issues || [],
      meta: {
        page: queries.page,
        limit: queries.limit,
        total,
        totalPages: Math.ceil(total / queries.limit) || 1,
      },
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
};

export const createIssue = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    let issueData = req.body as CreateIssueSchemaType;
    const book = await prisma.book.findUnique({
      where: { id: issueData.bookId },
    });
    const student = await prisma.student.findUnique({
      where: { id: issueData.studentId },
    });
    if (!book) {
      throw new Error("Book not found");
    }
    if (!student) {
      throw new Error("Student not found");
    }
    const activeIssue = await prisma.issue.findFirst({
      where: {
        bookId: issueData.bookId,
        status: "ISSUED",
      },
    });
    if (activeIssue) {
      const error: any = new Error("Book is already issued");
      error.statusCode = 409;
      throw error;
    }
    const issue = await prisma.issue.create({
      data: {
        bookId: issueData.bookId,
        studentId: issueData.studentId,
        issueDate: issueData.issueDate,
      },
      include: {
        book: true,
        student: true,
      },
    });
    console.log("CREATE ISSUE HIT", Date.now());
    return reply.status(200).send({
      success: true,
      issue,
      message: "OK",
    });
  } catch (error: unknown) {
    console.log(error);
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;

    return reply.status(400).send({
      success: false,
      message:
        err?.message ||
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not get",
    });
  }
};

export const returnBook = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as issueIdSchemaType;

    const issue = await prisma.issue.findUnique({
      where: { id: Number(id) },
    });

    if (!issue) {
      throw new Error("Issue record not found");
    }

    if (issue.status === "RETURNED") {
      throw new Error("Book already returned");
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: Number(id) },
      data: {
        status: "RETURNED",
        returnDate: new Date(),
      },
      include: {
        book: true,
        student: true,
      },
    });

    return reply.status(200).send({
      success: true,
      data: updatedIssue,
      message: "Book returned successfully",
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
        "Something went wrong",
    });
  }
};
