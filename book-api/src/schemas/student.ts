import { z } from "zod";

export const studentIdSchema = z.object({
  id: z.coerce
    .number({ error: "Invalid book Id" })
    .int({ error: "Book id should be Integer" })
    .positive({ error: "Book id can not be negative" }),
});

//: name(1..100), rollNo(1..20), phoneNo(7..15, digits and '+' only), country/state/city(1..60), photo(optional file).

export const createStudentSchema = z.object({
  name: z
    .string({ error: "Enter valid name" })
    .min(1, "Name is empty")
    .max(100, "Name should be less than 100 characters"),
  rollNo: z
    .string({ error: "Enter valid roll number" })
    .min(1, "Roll number is empty")
    .max(20, "Roll Number should be less than 20 characters"),
  phoneNo: z
    .string()
    .regex(
      /^\+?[0-9]{7,15}$/,
      "Phone number must be 7-15 digits and may start with '+'",
    ),
  country: z
    .string({ error: "Enter valid country name" })
    .min(1, "Country is empty")
    .max(60, "Country should be less than 60 characters"),
  state: z
    .string({ error: "Enter valid state name" })
    .min(1, "State is empty")
    .max(60, "State should be less than 60 characters"),
  city: z
    .string({ error: "Enter valid city name" })
    .min(1, "City is empty")
    .max(60, "city should be less than 60 characters"),
  photoFile: z.string().optional(),
});

export type StudentIdSchemaType = z.infer<typeof studentIdSchema>;
export type CreateStudentSchemaType = z.infer<typeof createStudentSchema>;
