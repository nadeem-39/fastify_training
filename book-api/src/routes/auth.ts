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

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/register",
    { preValidation: bodyParser, schema: { body: userRegisterSchema } },
    register,
  );
  app.post(
    "/login",
    { preValidation: bodyParser, schema: { body: userLoginSchema } },
    login,
  );
  app.post(
    "/forgot-password",
    { preValidation: bodyParser, schema: { body: userForgotPassEmailSchema } },
    userForgotPassEmail,
  );
  app.post(
    "/reset-password",
    { preValidation: bodyParser, schema: { body: resetPasswordSchema } },
    resetPassword,
  );
  app.get("/me", { preHandler: [app.authenticate] }, authMe);

  //   app.post("/register", { preValidation: bodyParser }, async (req, res) => {
  //     console.log(req.body);
  //   });
};
