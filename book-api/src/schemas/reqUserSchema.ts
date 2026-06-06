import z from "zod";

export const reqUserSchema = z.object({
  id: z
    .number({ error: "User id should be a number" })
    .min(1, "Use valid user id"),

  role: z
    .string()
    .min(1, "Password is empty")
    .max(100, "Password should be less than 255 characters"),
  iat: z.number(),
  exp: z.number(),
});

export type reqUserSchemaType = z.infer<typeof reqUserSchema>;
