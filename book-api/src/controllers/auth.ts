import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";
import bcrypt from "bcrypt";
import app from "../server.js";
import {
  type userLoginSchemaType,
  userLoginSchema,
} from "../schemas/userLogin.js";

// get all books
export async function login(req: FastifyRequest, reply: FastifyReply) {
  try {
    let userInfo = req.body as userLoginSchemaType;
    let data = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });

    if (!data || !(await bcrypt.compare(userInfo.password, data.password)))
      return reply.status(400).send({
        data: {
          success: false,
          message: "Invalid credentials",
          data,
        },
      });

    const token = app.jwt.sign(
      { email: data.email, role: data.role },
      { expiresIn: "7d" },
    );

    return reply.status(200).send({
      data: {
        success: true,
        token,
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
        },
        message: "Login successfully",
      },
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      data: {
        success: false,
        message: err.meta.driverAdapterError.cause.originalMessage,
      },
    });
  }
}
