import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { JWT_SECRET, prisma, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD } from "../../../server.js";
import bcrypt from "bcrypt";
import { getDefaultPermissionsForRole } from "../../../lib/apply-role-permissions.js";
import { OTP_TYPE, Permission } from "../../../lib/types.js";
import jwt from "jsonwebtoken";
import { Permission as DbPermission, Role as PrismaRole } from "../../../../generated/prisma/index.js";
import { TOKEN_TTL } from "../../../lib/contants.js";
import { isEmailVerified } from "../../../services/otp.js";
import { sendError } from "../../../lib/utils.js";
import { resolveAccessibleBranchIds, userCanAccessBranch, } from "../../../middlewares/branch-access/index.js";
import { resolveEffectivePermissions, resolveEffectiveRoles, resolveSessionBranchId, } from "../../../lib/apply-role-permissions.js";
export const registerUser = async (req, res) => {
    try {
        // Ensure req.body is parsed and is an object
        const body = typeof req.body === 'object' && req.body !== null ? req.body : {};
        let { name, email, password, phone, role } = req.body;
        if (!name || !email || !role) {
            return res.status(HTTP_STATUS.NO_CONTENT).json({ success: false, message: "Please provide required fields" });
        }
        if (role === "SUPERADMIN" || role === "DIRECTOR" || role === "PRINCIPAL") {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: `${role} accounts cannot be created via this endpoint`,
            });
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
        const rolePermissionsEnum = getDefaultPermissionsForRole(role);
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
        const { currentPassword: oldPassword, newPassword, confirmPassword } = req.body;
        // Only the authenticated user can change their own password.
        const authUserId = req.user?.id;
        if (!authUserId) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "Unauthorized" });
        }
        if (!oldPassword || !newPassword) {
            return sendError(res, "Please provide required fields", HTTP_STATUS.BAD_REQUEST);
        }
        if (newPassword !== confirmPassword) {
            return sendError(res, "Password Should Match", HTTP_STATUS.BAD_REQUEST);
        }
        const user = await prisma.user.findUnique({ where: { id: authUserId } });
        if (!user) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ success: false, message: "No user found" });
        }
        // Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
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
        let user = await prisma.user.findFirst({
            where: { email },
            include: {
                principalAssignment: true,
                schoolFaculty: { select: { branchId: true } },
            },
        });
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
                    include: {
                        principalAssignment: true,
                        schoolFaculty: { select: { branchId: true } },
                    },
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
        let branchId = null;
        if (user && user.principalAssignment) {
            branchId = user.principalAssignment.id;
        }
        else if (user?.schoolFaculty?.branchId) {
            branchId = user.schoolFaculty.branchId;
        }
        const sessionBranchId = resolveSessionBranchId(branchId, user);
        const sessionUser = {
            role: user.role,
            permissions: user.permissions,
            principalAssignment: user.principalAssignment,
            schoolFaculty: user.schoolFaculty,
        };
        // Base effective permissions from DB (Prisma enum values)
        const basePermissions = resolveEffectivePermissions(sessionUser, sessionBranchId);
        // Map to plain strings for the frontend
        const effectivePermissions = new Set(basePermissions);
        // For any DIRECTOR or PRINCIPAL, expose high-level fee permissions used by the frontend nav
        const isDirectorOrPrincipal = user.role.includes(PrismaRole.DIRECTOR) || user.role.includes(PrismaRole.PRINCIPAL);
        if (isDirectorOrPrincipal) {
            effectivePermissions.add(Permission.VIEW_FEE_SUMMARY);
            effectivePermissions.add(Permission.RECORD_FEE_TRANSACTION);
            effectivePermissions.add(Permission.VIEW_FEE_DOC);
        }
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                accessToken: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    permissions: Array.from(effectivePermissions),
                    roles: resolveEffectiveRoles(sessionUser, sessionBranchId),
                    branchId: sessionBranchId,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Something went wrong" });
    }
};
export const getSession = async (req, res) => {
    try {
        const authUser = req.user;
        if (!authUser?.id) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "Unauthorized" });
        }
        const branchId = typeof req.query?.branchId === "string" ? req.query.branchId : null;
        if (branchId) {
            const accessible = await resolveAccessibleBranchIds(authUser);
            if (!userCanAccessBranch(accessible, branchId)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: "You do not have access to this branch",
                });
            }
        }
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            select: {
                id: true,
                name: true,
                email: true,
                permissions: true,
                role: true,
                principalAssignment: { select: { id: true } },
                schoolFaculty: { select: { branchId: true } },
            },
        });
        if (!user) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ success: false, message: "User not found" });
        }
        const resolvedBranchId = resolveSessionBranchId(branchId, user);
        const sessionUser = {
            role: user.role,
            permissions: user.permissions,
            principalAssignment: user.principalAssignment,
            schoolFaculty: user.schoolFaculty,
        };
        const basePermissions = resolveEffectivePermissions(sessionUser, resolvedBranchId);
        const effectivePermissions = new Set(basePermissions);
        const isDirectorOrPrincipal = user.role.includes(PrismaRole.DIRECTOR) || user.role.includes(PrismaRole.PRINCIPAL);
        if (isDirectorOrPrincipal) {
            effectivePermissions.add(Permission.VIEW_FEE_SUMMARY);
            effectivePermissions.add(Permission.RECORD_FEE_TRANSACTION);
            effectivePermissions.add(Permission.VIEW_FEE_DOC);
        }
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Session refreshed",
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    permissions: Array.from(effectivePermissions),
                    roles: resolveEffectiveRoles(sessionUser, resolvedBranchId),
                    branchId: resolvedBranchId,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
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