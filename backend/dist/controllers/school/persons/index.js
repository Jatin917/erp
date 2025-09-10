import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { JWT_SECRET, prisma, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "@src/server.js";
import bcrypt from 'bcrypt';
import { roleDefaults } from '../../../lib/permission.js';
import { OTP_TYPE, Permission } from '@src/lib/types.js';
import jwt from 'jsonwebtoken';
import { Role } from "../../../../generated/prisma/index.js";
import { TOKEN_TTL } from "@src/lib/contants.js";
import { userInfo } from "os";
import { isEmailVerified } from "@src/services/otp.js";
export const registerUser = async (req, res) => {
    try {
        // Ensure req.body is parsed and is an object
        const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
        let { name, email, password, phone, role } = req.body;
        if (!name || !email || !role) {
            return res.status(HTTP_STATUS.NO_CONTENT).json({ success: false, message: "Please provide required fields" });
        }
        const success = await isEmailVerified(email, OTP_TYPE.VERIFY_OTP);
        if (!success) {
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
                isEmailVerified: Boolean(success),
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
        const { email, password, setupKey, username } = req.body;
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Please enter required fields" });
        }
        let user = await prisma.user.findFirst({ where: { email }, include: { principalAssignment: true } });
        console.log("email ", email, password, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD);
        // First user creation (SuperAdmin bootstrap)
        const userCount = await prisma.user.count();
        if (userCount === 0) {
            if (email === SUPERADMIN_EMAIL &&
                password === SUPERADMIN_PASSWORD) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user = await prisma.user.create({
                    data: {
                        name: "System SuperAdmin",
                        role: ['SUPERADMIN'],
                        permissions: ["ALL"], // all permissions
                        email,
                        password: hashedPassword,
                        isEmailVerified: true,
                        isPhoneVerified: false,
                    },
                    include: { principalAssignment: true }
                });
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to create SuperAdmin",
                });
            }
        }
        if (!user) {
            return res.status(404).json({ success: false, message: "No user found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Password is incorrect" });
        }
        const payload = { userId: user.id };
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: TOKEN_TTL,
        });
        // Remove duplicate property assignments and avoid overwriting with spread
        let branchId = null;
        if (user && user.principalAssignment) {
            branchId = user.principalAssignment.id;
        }
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: { accessToken: token,
                user: { name: user.name,
                    email: user.email, permissions: user.permissions, roles: user.role, branchId } }
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
export const userExist = async (req, res) => {
    try {
        const email = req.query.email;
        console.log("network req ", email);
        const user = await prisma.user.findFirst({ where: { email } });
        return res.status(HTTP_STATUS.OK).json({ message: "Founded", success: !!user });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
//# sourceMappingURL=index.js.map