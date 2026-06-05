import { FastifyRequest, FastifyReply } from "fastify";
import { reqUserSchemaType } from "../schemas/reqUserSchema.js";
import { env } from "../config/env.js";
export const authorize = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = request.user as reqUserSchemaType;

  if (user.role.toUpperCase() !== env.IS_ADMIN) {
    return reply.status(403).send({
      success: false,
      message: "You don't have permission to complete this operation",
    });
  }
};
