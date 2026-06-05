import type { FastifyPluginAsync } from "fastify";

import { paginationQueryForIssue } from "../schemas/query.js";

import { getIssues, createIssue, returnBook } from "../controllers/issue.js";
import { bodyParser } from "../lib/bodyParser.js";
import { createIssueSchema, issueIdSchema } from "../schemas/issue.js";
import { authorize } from "../lib/authorization.js";

export const issueRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/",
    {
      preHandler: [app.authenticate],
      schema: { querystring: paginationQueryForIssue },
    },
    getIssues,
  );

  app.post(
    "/",
    {
      preHandler: [app.authenticate, authorize],
      preValidation: bodyParser,
      schema: { body: createIssueSchema },
    },
    createIssue,
  );

  app.patch(
    "/:id/return",
    {
      preHandler: [app.authenticate, authorize],
      schema: { params: issueIdSchema },
    },
    returnBook,
  );
};
