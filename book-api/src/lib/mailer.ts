import { transporter } from "../config/nodemailer.js";
import { env } from "../config/env.js";
export async function sendEmail(
  email: string,
  subject: string,
  content: string,
) {
  await transporter.sendMail({
    from: env.SMTP_USER,
    to: email,
    subject: subject,
    html: content,
  });
}
