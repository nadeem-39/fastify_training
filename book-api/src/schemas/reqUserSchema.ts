import z from "zod";

export const reqUserSchema = z.object({
  email: z
    .email({ error: "Need valid email" })
    .min(1, "Email is empty")
    .max(255, "Email should be less than 100 characters"),
  role: z
    .string()
    .min(1, "Password is empty")
    .max(100, "Password should be less than 255 characters"),
  iat: z.number(),
  exp: z.number(),
});

export type reqUserSchemaType = z.infer<typeof reqUserSchema>;
