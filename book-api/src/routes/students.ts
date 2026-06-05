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

export const studentRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQuery },
    },
    getStudents,
  );
  app.get(
    "/:id",
    {
      preHandler: [app.authenticate],
      schema: {
        params: studentIdSchema,
      },
    },
    getStudentById,
  );
  app.get(
    "/:id/photo",
    {
      schema: {
        params: studentIdSchema,
      },
    },
    getStudentImage,
  );
  app.post(
    "/",
    {
      preHandler: [app.authenticate, authorize],
    },
    addStudent,
  );
  app.put(
    "/:id",
    {
      preHandler: [app.authenticate, authorize],
      schema: {
        params: studentIdSchema,
      },
    },
    editStudent,
  );
  app.delete(
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
