import type { FastifyPluginAsync } from "fastify";

import { paginationQueryForIssue } from "../schemas/query.js";

import { getIssues, createIssue, returnBook } from "../controllers/issue.js";
import { bodyParser } from "../lib/bodyParser.js";
import { createIssueSchema, issueIdSchema } from "../schemas/issue.js";
import { authorize } from "../lib/authorization.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const issueRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: { querystring: paginationQueryForIssue },
    },
    getIssues,
  );

  server.post(
    "/",
    {
      preHandler: [server.authenticate, authorize],
      preValidation: bodyParser,
      schema: { body: createIssueSchema },
    },
    createIssue,
  );

  server.patch(
    "/:id/return",
    {
      preHandler: [server.authenticate, authorize],
      schema: { params: issueIdSchema },
    },
    returnBook,
  );
};
