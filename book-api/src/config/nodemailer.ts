import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

import nodemailer from "nodemailer";
import { env } from "./env.js";
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});
