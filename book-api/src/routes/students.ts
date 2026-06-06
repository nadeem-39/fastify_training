import type { FastifyPluginAsync } from "fastify";

import { paginationQuery } from "../schemas/query.js";

import {
  addStudent,
  deleteStudentById,
  editStudent,
  getStudentById,
  getStudentImage,
  getStudents,
} from "../controllers/student.js";
import { studentIdSchema } from "../schemas/student.js";
import { authorize } from "../lib/authorization.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const studentRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQuery },
    },
    getStudents,
  );
  server.get(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: studentIdSchema,
      },
    },
    getStudentById,
  );
  server.get(
    "/:id/photo",
    {
      schema: {
        params: studentIdSchema,
      },
    },
    getStudentImage,
  );
  server.post(
    "/",
    {
      preHandler: [app.authenticate, authorize],
    },
    addStudent,
  );
  server.put(
    "/:id",
    {
      preHandler: [app.authenticate, authorize],
      schema: {
        params: studentIdSchema,
      },
    },
    editStudent,
  );
  server.delete(
    "/:id",
    {
      preHandler: [app.authenticate, authorize],
      schema: {
        params: studentIdSchema,
      },
    },
    deleteStudentById,
  );
};
