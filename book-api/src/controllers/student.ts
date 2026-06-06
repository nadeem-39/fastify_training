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
  createStudentSchema,
  CreateStudentSchemaType,
  type StudentIdSchemaType,
} from "../schemas/student.js";

import { fileValidation } from "../lib/fileValidation.js";

import { deleteFile } from "../lib/deleteFile.js";
import { ZodError } from "zod";

// get all students
export async function getStudents(req: FastifyRequest, reply: FastifyReply) {
  try {
    let queries = req.query as paginationQueryType;

    // create where command for db execution.
    console.log(queries);

    const where = queries.search
      ? {
          OR: [
            {
              name: {
                contains: queries.search,
              },
            },
            {
              rollNo: {
                contains: queries.search,
              },
            },
          ],
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
    if (!student) {
      return reply.status(404).send({
        success: false,
        message: "Book not found",
      });
    }
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
      photoFile?: string;
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

        studentInfo.photoFile = fileName;
      }
    }

    let studentData = createStudentSchema.parse(studentInfo);

    let data = await prisma.student.create({
      data: studentData,
    });

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
    console.log(error);

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not add",
    });
  }
}

// edit student by id
export async function editStudent(
  req: FastifyRequest<{
    Params: StudentIdSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    const parts = req.parts();
    const studentInfo: {
      name?: string;
      rollNo?: string;
      phoneNo?: string;
      country?: string;
      state?: string;
      city?: string;
      photoFile?: string;
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

        studentInfo.photoFile = fileName;
      }
    }

    let params = req.params;
    let studentData = createStudentSchema.parse(studentInfo);
    let oldStudentData = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!oldStudentData) {
      return reply.status(404).send({
        success: false,
        message: "Student not found",
      });
    }

    if (oldStudentData && oldStudentData.photoFile && studentData.photoFile)
      deleteFile(`uploads/students/${oldStudentData?.photoFile}`);

    let data = await prisma.student.update({
      where: {
        id: params.id,
      },
      data: studentData,
    });

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
    console.log(error);

    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not edit",
    });
  }
}

// delete student by id
export async function deleteStudentById(
  req: FastifyRequest<{
    Params: StudentIdSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    let params = req.params;
    let oldStudentData = await prisma.student.findUnique({
      where: {
        id: params.id,
      },
    });

    if (oldStudentData && oldStudentData.photoFile)
      deleteFile(`uploads/students/${oldStudentData?.photoFile}`);

    let student = await prisma.student.delete({
      where: {
        id: params.id,
      },
    });
    return reply.status(200).send({
      success: true,
      data: student,
      message: "Delete successfully",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    console.log(err);
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not delete",
    });
  }
}

// download file
export async function getStudentImage(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  let params = req.params as StudentIdSchemaType;
  const student = await prisma.student.findUnique({
    where: { id: params.id },
  });
  if (!student?.photoFile)
    return reply.code(404).send({ success: false, message: "Not found" });
  const abs = `uploads/students/${student.photoFile}`;
  console.log(abs, "------------------------------");
  if (!existsSync(abs))
    return reply.code(404).send({ success: false, message: "Missing" });

  const safeName = `${student.name.replace(/[^\w.-]/g, "_")}${path.extname(abs)}`;

  reply.header("Content-Disposition", `attachment; filename="${safeName}"`);
  return reply.send(createReadStream(abs));
}
