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
import {
  validatorCompiler,
  serializerCompiler,
} from "fastify-type-provider-zod";

import { booksRoutes } from "./routes/books.js";

// cors for browser
await app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
});

// setting zod with fastify
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// checking health
app.get("/health", async () => ({ status: "ok" }));

// book routes
app.register(booksRoutes, { prefix: "/books" });

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
