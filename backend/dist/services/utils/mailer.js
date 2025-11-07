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
export const sendMail = async (options) => {
    await transporter.sendMail({
        from: `"School ERP" <${process.env.SMTP_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
};
//# sourceMappingURL=mailer.js.map