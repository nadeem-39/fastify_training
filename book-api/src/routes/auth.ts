import type { FastifyPluginAsync } from "fastify";
import {
  type userLoginSchemaType,
  userLoginSchema,
} from "../schemas/userLogin.js";
import { login } from "../controllers/auth.js";
export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/", { schema: { body: userLoginSchema } }, login);
};
