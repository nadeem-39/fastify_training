import dotenv from "dotenv";
const result = dotenv.config({
    path: ".env",
});
import { z } from "zod";
const envSchema = z.object({
    PORT: z.coerce.number().default(4000),
    TYPE: z.string().default("dev"),
});
console.log(result);
export const env = envSchema.parse(process.env);
