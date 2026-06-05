import { env } from "./config/env.js";
const isDev = env.TYPE !== "production";
import Fastify from "fastify";
import cors from "@fastify/cors";
const app = Fastify({
  logger: {
    level: isDev ? "debug" : "info",
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
    redact: {
      paths: ["req.headers.authorization", "*.password", "body.password"],
      censor: "[REDACTED]",
    },
  },
});
import multipart from "@fastify/multipart";
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";

import fastifyJwt from "@fastify/jwt";

import { booksRoutes } from "./routes/books.js";
import { authRoutes } from "./routes/auth.js";
import { studentRoutes } from "./routes/students.js";
import { issueRoutes } from "./routes/issue.js";

// cors for browser
await app.register(cors, {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
});

// adding form data parser
await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } });

// setting zod with fastify
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// adding jwt token
await app.register(fastifyJwt, { secret: env.JWT_SECRET });

// adding custom authenticate function
app.decorate(
  "authenticate",
  async (req: Fastify.FastifyRequest, reply: Fastify.FastifyReply) => {
    try {
      await req.jwtVerify();
    } catch {
      reply.code(401).send({ success: false, message: "Unauthorized access" });
    }
  },
);

// checking health
app.get("/health", async () => ({ status: "ok" }));

// book routes
app.register(booksRoutes, { prefix: "/books" });

// student routes
app.register(studentRoutes, { prefix: "/students" });

//auth routes
app.register(authRoutes, { prefix: "/auth" });

// issue routes
app.register(issueRoutes, { prefix: "/issues" });

// error handler
app.setErrorHandler((err: any, req, reply) => {
  req.log.error({ err }, "unhandled error");
  reply.status(err.statusCode || 500).send({
    success: false,
    message: err.message || "Internal server error",
  });
});

// listing port
app.listen({ port: env.PORT });

export default app;
