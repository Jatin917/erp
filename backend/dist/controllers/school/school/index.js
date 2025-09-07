import { error } from "console";
import { Role } from "../../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { defaultPassword, prisma } from "../../../server.js";
import multer from "multer";
import path from "path";
import bcrypt from 'bcrypt';
import fs from "fs";
import { roleDefaults, rolesAre } from "../../../lib/permission.js";
import { OTP_TYPE } from "@src/lib/types.js";
import { isEmailVerified, verifyOtp } from "@src/services/otp.js";
// Updated createBranch to accept tx for transactions
const createBranch = async (tx, address, principalId, name, schoolId, softwareCharge) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principalId,
                name,
                schoolId,
                address,
                softwareCharge: parseFloat(softwareCharge)
            }
        });
        return branch;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
// ---------- Helper function for director/principal creation ----------
const findOrCreateUser = async (role, userData, tx) => {
    console.log("userdata is ", userData);
    const existingUser = await tx.user.findUnique({
        where: { email: userData.email },
    });
    if (existingUser) {
        // Ensure the role is set
        if (!existingUser.role.includes(role)) {
            await tx.user.update({
                where: { email: userData.email },
                data: { role: { push: role }, phone: userData.contact }, // Prisma array field push
            });
        }
        return existingUser.id;
    }
    else {
        // Check verification before creation
        const success = await isEmailVerified(userData.email, OTP_TYPE.VERIFY_OTP);
        if (success) {
            throw new Error(`${role} email is not verified. Please verify first.`);
        }
        const roles = [role];
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        console.log("user data ", userData);
        const newUser = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword, // If no password, maybe generate a temp one
                role: roles,
                isEmailVerified: true,
                isPhoneVerified: false,
                phone: userData.contact
            },
        });
        return newUser.id;
    }
};
export const createSchool = async (req, res) => {
    const file = req.file; // Multer puts uploaded file here
    try {
        // Parse incoming body fields from multipart/form-data
        const schoolName = req.body.schoolName || req.body.name;
        const principals = req.body.principals;
        const currentSession = req.body.currentSession;
        // Parse director & principal from JSON strings
        const director = req.body.directors;
        console.log("Parsed body:", { schoolName, director, currentSession });
        let schoolId;
        let branchIds = [];
        await prisma.$transaction(async (tx) => {
            const directorId = await findOrCreateUser("DIRECTOR", director[0], tx);
            principals.forEach(async (principal) => {
                const principalId = await findOrCreateUser("PRINCIPAL", { name: principal.name, email: principal.email, contact: principal.contact }, tx);
                const branch = await createBranch(tx, principal.branch.address, principalId, schoolName, school.id, principal.softwareCharge);
                if (!branch)
                    throw new Error("Error creating branch");
                let branchId = branch.id;
                branchIds.push(branchId);
                await tx.academicSession.create({
                    data: {
                        name: currentSession,
                        branchId: branch.id,
                        isCurrent: true,
                    },
                });
            });
            const school = await tx.school.create({
                data: {
                    name: schoolName,
                    createdById: directorId,
                },
            });
            schoolId = school.id;
            if (!file) {
                throw new Error("NO File Found. Please Try Again");
            }
        });
        // ---------- File Handling AFTER transaction ----------
        // @ts-ignore
        // Save logo path in DB
        branchIds.forEach(async (branchId) => {
            if (!schoolId || !branchId) {
                throw new Error("School ID or Branch ID is missing after transaction.");
            }
            const uploadDir = path.join("uploads", String(schoolId), String(branchId));
            fs.mkdirSync(uploadDir, { recursive: true });
            const ext = path.extname(file.originalname);
            const destPath = path.join(uploadDir, `logo${ext}`);
            fs.renameSync(file.path, destPath);
            await prisma.branch.update({
                where: { id: branchId },
                data: { logoUrl: destPath },
            });
        });
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Created School with default branch",
        });
    }
    catch (error) {
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path); // clean temp file if error
        }
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message,
        });
    }
};
export const getSchools = async (req, res) => {
    try {
        const { createdBy: email } = req.query; // email of the "guy"
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: email",
            });
        }
        // find user by email
        const user = await prisma.user.findFirst({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        let schools = [];
        if (user.role.includes(rolesAre.SUPERADMIN)) {
            // SUPERADMIN → return all schools
            schools = await prisma.school.findMany({
                include: {
                    branches: {
                        select: {
                            id: true,
                            logoUrl: true,
                        },
                    },
                },
            });
        }
        else if (user.role.includes(rolesAre.DIRECTOR)) {
            // DIRECTOR → only schools created by this user
            schools = await prisma.school.findMany({
                where: { createdById: user.id },
                include: {
                    branches: {
                        select: {
                            id: true,
                            logoUrl: true,
                        },
                    },
                },
            });
        }
        else {
            return res.status(403).json({
                success: false,
                message: "Not authorized to fetch schools",
            });
        }
        const formatted = schools.map((school) => {
            const branchCount = school.branches.length;
            const logo = branchCount > 0 ? school.branches[0].logoUrl : null;
            return {
                sid: school.id,
                id: school.id, // same as sid
                logo,
                branchCount,
            };
        });
        return res.status(200).json({
            success: true,
            message: "Schools fetched successfully",
            data: formatted,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
export const getBranches = async (req, res) => {
    let { createdBy } = req.query;
    if (!createdBy) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ success: false, message: "Fill required fields" });
    }
    const user = await prisma.user.findFirst({
        where: { email: createdBy },
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }
    let schools = [];
    try {
        const user = await prisma.user.findFirst({ where: { email: createdBy } });
        if (!user) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "User not found" });
        }
        const roles = user.role;
        // SUPERADMIN: return all branches
        if (roles.includes(rolesAre.SUPERADMIN)) {
            const branches = await prisma.branch.findMany();
            schools = branches.map(branch => ({
                name: `${branch.name} ${branch.address}`,
                id: branch.id,
                logo: branch.logoUrl
            }));
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Found All Branches",
                data: { schools },
            });
        }
        // DIRECTOR: get schools + their branches
        if (roles.includes(rolesAre.DIRECTOR)) {
            const foundSchools = await prisma.school.findMany({
                where: { createdById: user.id },
                include: { branches: true },
            });
            // Flatten all branches from all schools and format them
            foundSchools.forEach((school) => {
                if (school.branches?.length) {
                    school.branches.forEach((branch) => {
                        schools.push({
                            name: `${branch.name} ${branch.address}`,
                            id: branch.id,
                            logo: branch.logoUrl
                        });
                    });
                }
            });
        }
        // PRINCIPAL: get branches directly assigned
        if (roles.includes(rolesAre.PRINCIPAL)) {
            const foundBranches = await prisma.branch.findMany({
                where: { principalId: user.id },
            });
            schools = foundBranches.map((branch) => ({
                name: `${branch.name} ${branch.address}`,
                id: branch.id,
                logo: branch.logoUrl
            }));
        }
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Found All Branches",
            data: { schools },
        });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message,
        });
    }
};
//# sourceMappingURL=index.js.map