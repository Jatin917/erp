import { HTTP_STATUS } from "../../lib/http-codes.js";
import { OTP_TYPE } from "../../lib/types.js";
import { JWT_SECRET, prisma } from "../../server.js";
import { emailVerification, sendOtpEmailFunction } from "../../services/otp.js";
import jwt from "jsonwebtoken";
export const sendOtpEmailSignController = async (req, res) => {
    try {
        const email = req.body.email;
        const { success, message } = await sendOtpEmailFunction(email, OTP_TYPE.SIGNIN_OTP);
        return res.status(success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json({ message: message, success: true });
    }
    catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
export const emailVerificationSignController = async (req, res) => {
    try {
        const receivedOtp = req.body.otp;
        const email = req.body.email;
        const role = req.body.role;
        console.log("email verification ", receivedOtp, email);
        if (!email || !receivedOtp) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "All Fields required", success: false });
        }
        const user = await prisma.user.findFirst({ where: { email: email }, include: { principalAssignment: true } });
        if (!user) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "User Not found", success: false });
        }
        const payload = { userId: user.id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
        let branchId = null;
        if (user && user.principalAssignment) {
            branchId = user.principalAssignment.id;
        }
        const { success, message } = await emailVerification(receivedOtp, email, OTP_TYPE.SIGNIN_OTP);
        if (success)
            return res.status(HTTP_STATUS.OK).json({ success: true, message: message, data: { accessToken: token, user: { name: user.name,
                        email: user.email, permissions: user.permissions, roles: user.role, branchId } } });
    }
    catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
export const sendOtpEmailVerifyController = async (req, res) => {
    try {
        const email = req.body.email;
        const { success, message } = await sendOtpEmailFunction(email, OTP_TYPE.VERIFY_OTP);
        return res.status(success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json({ message: message, success: true });
    }
    catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
export const emailVerificationVerifyController = async (req, res) => {
    try {
        const receivedOtp = req.body.otp;
        const userId = req.body.email;
        const role = req.body.role;
        const { success, message } = await emailVerification(receivedOtp, userId, OTP_TYPE.VERIFY_OTP);
        return res.status(success ? HTTP_STATUS.OK : HTTP_STATUS.UNAUTHORIZED).json({ message: message, success: true });
    }
    catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
//# sourceMappingURL=otp.js.map