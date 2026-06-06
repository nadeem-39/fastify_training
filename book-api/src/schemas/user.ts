import { z } from "zod";

export const userLoginSchema = z.object({
  email: z
    .email({ error: "Need valid email" })
    .min(1, "Email is empty")
    .max(255, "Email should be less than 100 characters"),
  password: z
    .string()
    .min(1, "Password is empty")
    .max(100, "Password should be less than 255 characters"),
});

export const userRegisterSchema = z.object({
  firstName: z
    .string({ error: "Enter valid first name" })
    .min(1, "First name is empty")
    .max(45, "First Name should be less than 45 characters"),

  middleName: z
    .string({ error: "Enter valid middle name" })
    .min(1, "Middle name is empty")
    .max(45, "Middle Name should be less than 45 characters")
    .optional(),

  lastName: z
    .string({ error: "Enter valid last name" })
    .min(1, "Last name is empty")
    .max(45, "Last Name should be less than 45 characters"),

  email: z
    .email({ error: "Need valid email" })
    .min(1, "Email is empty")
    .max(255, "Email should be less than 255 characters"),

  username: z
    .string({ error: "Enter valid username" })
    .min(3, "Username is empty")
    .max(45, "Username should be less than 45 characters"),

  password: z
    .string({ error: "Enter valid password" })
    .min(8, "Password should be greater than 8 characters")
    .max(64, "Password should be less than 100 characters"),
});

export const userForgotPassEmailSchema = z.object({
  email: z
    .email({ error: "Need valid email" })
    .min(1, "Email is empty")
    .max(255, "Email should be less than 255 characters"),
});

export const resetPasswordSchema = z.object({
  token: z.string().length(64),
  password: z.string().min(8).max(64),
});

export type userRegisterSchemaType = z.infer<typeof userRegisterSchema>;
export type userLoginSchemaType = z.infer<typeof userLoginSchema>;
export type userForgotPassEmailSchemaType = z.infer<
  typeof userForgotPassEmailSchema
>;
export type resetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
