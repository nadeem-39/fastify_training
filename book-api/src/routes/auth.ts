import type { FastifyPluginAsync } from "fastify";
import {
  resetPasswordSchema,
  userForgotPassEmailSchema,
  userLoginSchema,
  userRegisterSchema,
} from "../schemas/user.js";
import {
  authMe,
  login,
  register,
  resetPassword,
  userForgotPassEmail,
} from "../controllers/auth.js";
import { bodyParser } from "../lib/bodyParser.js";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export const authRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.post(
    "/register",
    { preValidation: bodyParser, schema: { body: userRegisterSchema } },
    register,
  );
  server.post(
    "/login",
    { preValidation: bodyParser, schema: { body: userLoginSchema } },
    login,
  );
  server.post(
    "/forgot-password",
    { preValidation: bodyParser, schema: { body: userForgotPassEmailSchema } },
    userForgotPassEmail,
  );
  server.post(
    "/reset-password",
    { preValidation: bodyParser, schema: { body: resetPasswordSchema } },
    resetPassword,
  );
  server.get("/me", { preHandler: [server.authenticate] }, authMe);
};
