// const nodemailer = require("nodemailer");
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { emailVerified, otpStorage } from '../../server.js';
// import TelesignSDK from 'telesignenterprisesdk';
dotenv.config();
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: otp,
        html: `<p>Your OTP code is: <b>${otp}</b></p><p>It is valid for the next 5 minutes.</p>`,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
const generateOtp = (userid) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStorage.set(userid, { otp, expiresAt: Date.now() + 300000 });
        return otp;
    }
    catch (error) {
        console.log(error.message);
        return 0;
    }
};
// const sendOtpSms = async (number:string, otp:string) => {
//   try {
//     const customerId = process.env.CUSTOMER_ID;
//     const apiKey = process.env.TELESIGN_API_KEY;
//     const phoneNumber = number;
//     const verifyCode = otp; // Generates OTP
//     const params = {
//       verify_code: verifyCode,
//       sender_id: process.env.SENDER_ID || "DefaultSender", // Use env variable or fallback
//     };
//     const client = new TelesignSDK(customerId, apiKey);
//     const smsPromise = new Promise((resolve, reject) => {
//       client.verify.sms((error, responseBody) => {
//         if (error) {
//           reject(`Unable to send message: ${error}`);
//         } else {
//           resolve(responseBody);
//         }
//       }, phoneNumber, params);
//     });
//     const response = await smsPromise;
//     console.log("SMS sent successfully:", response);
//     return { success: true, otp: verifyCode }; // Return OTP for storage/verification
//   } catch (error) {
//     console.error("Error sending OTP:", error.message);
//     return { success: false, message: error.message };
//   }
// };
export const sendOtpEmailController = async (req, res) => {
    try {
        const email = req.body.email;
        const otp = generateOtp(email);
        const status = await sendOtpEmail(email, String(otp));
        if (status) {
            return res.status(200).json({ message: "OTP sent successfully" });
        }
        return res.status(401).json({ message: "failed to send otp" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// export const sendOtpSmsController = async(req, res) =>{
//   try {
//     const phoneNumber = req.body.userId;
//     const otp = generateOtp(phoneNumber);
//     const status = await sendOtpSms(phoneNumber, otp);
//     if(status){
//       return res.status(200).json({message:"OTP sent successfully"})
//     }
//     return res.status(401).json({message:"failed to send otp"});
//   } catch (error) {
//     res.status(500).json({message:error.message});
//   }
// }
export const emailVerificationController = async (req, res) => {
    try {
        const receivedOtp = req.body.otp;
        const userId = req.body.email;
        const storedOtp = otpStorage.get(userId);
        if (storedOtp && storedOtp.otp === Number(receivedOtp) && Date.now() < storedOtp.expiresAt) {
            console.log("OTP is valid!");
            otpStorage.delete(userId);
            emailVerified.set(userId, { isVerified: true, expiresAt: Date.now() + 300000 });
            return res.status(200).json({ message: "OTP verified successfully" });
        }
        return res.status(401).json({ message: "Otp expired or invalid" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=otp.js.map