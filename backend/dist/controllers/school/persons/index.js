import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { emailVerified, prisma } from "../../../server.js";
import bcrypt from 'bcrypt';
import { roleDefaults } from '../../../lib/permission.js';
import { sendOtpEmailController } from "../../auth/otp.js";
import { Permission } from '../../../lib/types.js';
export const registerUser = async (req, res) => {
    try {
        // Ensure req.body is parsed and is an object
        const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
        let { name, email, password, phone, role } = body;
        if (!name || !email || !role) {
            return res.status(HTTP_STATUS.NO_CONTENT).json({ success: false, message: "Please provide required fields" });
        }
        const isEmailVerified = emailVerified.get(email)?.isVerified || false;
        if (!isEmailVerified) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Please Try Again" });
        }
        // isPhoneVerified = isPhoneVerified ?? false;
        if (!password) {
            password = "default";
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const rolePermissions = roleDefaults[role] || [];
        const rolePermissionsEnum = rolePermissions.map((perm) => Permission[perm]);
        const roles = [role];
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                phone,
                role: roles,
                isEmailVerified,
                isPhoneVerified: false,
                permissions: { set: rolePermissionsEnum }
            }
        });
        return res.status(HTTP_STATUS.CREATED).json({ success: true, user });
    }
    catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
};
export const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        // Find user by email
        const user = await prisma.user.findFirst({ where: { email } });
        if (!user) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ success: false, message: "No user found" });
        }
        // Compare old password
        const isMatch = bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "Old password is incorrect" });
        }
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        return res
            .status(HTTP_STATUS.OK)
            .json({ success: true, message: "Password updated successfully" });
    }
    catch (error) {
        console.error(error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: "Something went wrong" });
    }
};
export const login = async (req, res) => {
    try {
    }
    catch (error) {
    }
};
//# sourceMappingURL=index.js.map