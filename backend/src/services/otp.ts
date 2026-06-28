// const nodemailer = require("nodemailer");
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { RedisClient } from './redis.js';
import { OTP_TYPE } from '@src/lib/types.js';

// store OTP with TTL (e.g. 5 minutes)
// store OTP
export async function storeOtp(email: string, otp: number, type:OTP_TYPE) {
  const redis = await RedisClient(); // get client instance
  const key = `${type}:${email}`;
  await redis.setEx(key, 300, JSON.stringify({ otp })); // expires in 300 sec
}

// verify OTP
export async function verifyOtp(email: string, otp: number, type:OTP_TYPE) {
  const redis = await RedisClient(); // you need the client here too
  const key = `${type}:${email}`;
  const data = await redis.get(key); // ✅ correct usage
  console.log("data of otp ", data);
  if (!data) return false; // expired or not found

  const { otp: storedOtp } = JSON.parse(data);
  console.log("stored otp ", storedOtp, otp);
  if (storedOtp !== otp) return false;

  // mark as verified
  if(type===OTP_TYPE.VERIFY_OTP) await redis.setEx(`${type}:${email}`, 3600, JSON.stringify({ isVerified: true }));
  await redis.del(key); // cleanup OTP
  return true;
}

export async function isEmailVerified(email:string, type:OTP_TYPE) {
  const redis = await RedisClient();
  const key = `${type}:${email}`;
    const data = await redis.get(key); // ✅ correct usage

  if (!data) return false; // expired or not found
  const isVerified = await redis.get(key);
  if(!isVerified){
    return false;
  }
  return isVerified;
}
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

const sendOtpEmail = async (email:string, otp:string) => {
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
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};


const generateOtp = (userid:string, type:OTP_TYPE) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    storeOtp(userid, otp, type);
    return otp;
  } catch (error:any) {
    console.log(error.message);
    return 0;
  }
}


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
export const sendOtpEmailFunction = async(email:string, type:OTP_TYPE) =>{
  try {
    const otp:number = generateOtp(email, type);
    const status = await sendOtpEmail(email, String(otp));
    if(status){
      return {success:true, message:"Sent Successfully"};
    }
    throw Error("Failed sending OTP");
  } catch (error:any) {
    return {success:false, message:error.message};
  }
}
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

export const emailVerification = async (otp:string, email:string, type:OTP_TYPE) =>{
    let receivedOtp = otp;
    let userId = email;
  try {
    const success = await verifyOtp(userId, Number(receivedOtp), type);
    if (success) {
      return {success:true, message:"OTP Verified"};
    }
    throw Error("Failed Verifying OTP");
} catch (error) {
    return {success:false, message:(error as Error).message};
  }
}