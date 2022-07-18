import nodemailer from "nodemailer";
interface MailOptions {
  email: string;
  subject: string;
  message: string;
}
// const nodemailer = require("nodemailer");
const hostname = "smtp.gmail.com";
const username = "nodetesting101@gmail.com";
const password = "kvzwdcsadlptduoh";

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
