import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions) => {
  await transporter.sendMail({
    from: `"School ERP" <${process.env.SMTP_EMAIL}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};
