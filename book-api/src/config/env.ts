import dotenv from "dotenv";
import { z } from "zod";
const result = dotenv.config({
  path: ".env",
});

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  TYPE: z.string().default("dev"),
  DATABASE_URL: z.string(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(3306),
  JWT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_AUTH_URI: z.string(),
  GOOGLE_TOKEN_URI: z.string(),
  GOOGLE_AUTH_PROVIDER: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SMTP_USER: z.email(),
  SMTP_PASS: z.string(),
});

export const env = envSchema.parse(process.env);
