import nodemailer from "nodemailer";
import config from "../config/config";
interface MailOptions {
  email: string;
  subject: string;
  message: string;
}

const { domainEmail, domainEmailPassowrd, emailHostServiceProvider } = config;
const hostname = emailHostServiceProvider;
const username = domainEmail;
const password = domainEmailPassowrd;

const transporter = nodemailer.createTransport({
  host: hostname,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: username,
    pass: password,
  },
  logger: true,
});

export default async function sendEMail(mailOptions: MailOptions) {
  const info = await transporter.sendMail({
    from: username,
    to: mailOptions.email,
    subject: mailOptions.subject,
    text: mailOptions.message,
  });
  return info.response.includes("OK");
}
