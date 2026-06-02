import { z } from "zod";

export const userLoginSchema = z.object({
  email: z
    .email({ error: "Need valid email" })
    .min(1, "Email is empty")
    .max(100, "Email should be less than 100 characters"),
  password: z
    .string()
    .min(1, "Password is empty")
    .max(100, "Password should be less than 100 characters"),
});

export type userLoginSchema = z.infer<typeof userLoginSchema>;
export type userLoginSchemaType = z.infer<typeof userLoginSchema>;
