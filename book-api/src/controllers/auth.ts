import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma.js";
import { dbErrorType } from "../schemas/Error.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  type userLoginSchemaType,
  type userRegisterSchemaType,
  type resetPasswordSchemaType,
  type userForgotPassEmailSchemaType,
} from "../schemas/user.js";
import { sendEmail } from "../lib/mailer.js";
import { ZodError } from "zod";
import { reqUserSchemaType } from "../schemas/reqUserSchema.js";

// login user
export async function login(
  req: FastifyRequest<{
    Body: userLoginSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    let userInfo = req.body;
    let data = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });

    if (!data || !(await bcrypt.compare(userInfo.password, data.passwordHash)))
      return reply.status(400).send({
        success: false,
        message: "Invalid credentials",
        data,
      });
    const token = req.server.jwt.sign(
      { id: data.id, role: data.role },
      { expiresIn: "7d" },
    );

    return reply.status(200).send({
      success: true,
      data: {
        name: data.firstName + " " + data.middleName + " " + data.lastName,
        email: data.email,
        role: data.role,
        token,
      },
      message: "Login successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message: err.meta,
    });
  }
}

// register me

export async function register(
  req: FastifyRequest<{
    Body: userRegisterSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    let { firstName, lastName, middleName, password, email, username } =
      req.body;
    let passwordHash = await bcrypt.hash(password, 10);

    let data = await prisma.user.create({
      data: { firstName, lastName, middleName, passwordHash, email, username },
    });

    return reply.status(201).send({
      success: true,
      data,
      message: "Register Successfully",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message:
        err?.meta?.driverAdapterError?.cause?.originalMessage ||
        "Something went wrong could not register user",
    });
  }
}

// auth me
export async function authMe(req: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = (req.user as reqUserSchemaType).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return reply.status(201).send({
      success: true,
      user,
      message: "Auth Successfully",
    });
  } catch (error: unknown) {
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message: err?.meta?.driverAdapterError.cause.originalMessage,
    });
  }
}

export async function userForgotPassEmail(
  req: FastifyRequest<{
    Body: userForgotPassEmailSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    let userInfo = req.body;
    let data = await prisma.user.findUnique({
      where: {
        email: userInfo.email,
      },
    });

    if (data) {
      const resetToken = crypto.randomBytes(32).toString("hex");

      const resetExpires = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.user.update({
        where: { id: data.id },
        data: {
          resetToken,
          resetExpires,
        },
      });

      let content = `
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>

      <a href="http://localhost:5173/reset-password?token=${resetToken}">
        Reset Password
      </a>

      <p>This link will expire in 30 minutes.</p>

      <p>If you did not request this, please ignore this email.</p>
    `;

      await sendEmail(data.email, "Password reset link", content);
    }

    return reply.status(200).send({
      success: true,
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message: err?.meta?.driverAdapterError?.cause?.originalMessage,
    });
  }
}

export async function resetPassword(
  req: FastifyRequest<{
    Body: resetPasswordSchemaType;
  }>,
  reply: FastifyReply,
) {
  try {
    const { token, password } = req.body;
    // console.log("Hiii-----------", token, password);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return reply.status(400).send({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
        resetToken: null,
        resetExpires: null,
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Successfully reset password",
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: error.issues[0].message,
      });
    }
    const err = error as dbErrorType;
    return reply.status(400).send({
      success: false,
      message: err.meta?.driverAdapterError.cause.originalMessage,
    });
  }
}
