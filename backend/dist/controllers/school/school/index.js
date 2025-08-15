import { error } from "console";
import { Role } from "../../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { defaultPassword, emailVerified, prisma } from "../../../server.js";
// Updated createBranch to accept tx for transactions
const createBranch = async (tx, address, principalId, name, schoolId) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principalId,
                name,
                schoolId,
                address
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
    const existingUser = await tx.user.findUnique({
        where: { email: userData.email },
    });
    if (existingUser) {
        // Ensure the role is set
        if (!existingUser.role.includes(role)) {
            await tx.user.update({
                where: { email: userData.email },
                data: { role: { push: role } }, // Prisma array field push
            });
        }
        return existingUser.id;
    }
    else {
        // Check verification before creation
        const verification = emailVerified.get(userData.email);
        if (!verification || !verification.isVerified) {
            throw new Error(`${role} email is not verified. Please verify first.`);
        }
        const roles = [role];
        const newUser = await tx.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: defaultPassword, // If no password, maybe generate a temp one
                role: roles,
                isEmailVerified: true,
                isPhoneVerified: false,
            },
        });
        return newUser.id;
    }
};
import multer from "multer";
import path from "path";
import fs from "fs";
const upload = multer({ dest: "temp/" }); // temp dir
export const createSchool = async (req, res) => {
    const file = req.file; // Multer puts uploaded file here
    try {
        const { schoolName, address, director, principal, currentSession } = req.body;
        let schoolId;
        let branchId;
        await prisma.$transaction(async (tx) => {
            const directorId = await findOrCreateUser("DIRECTOR", director, tx);
            const principalId = await findOrCreateUser("PRINCIPAL", principal, tx);
            const school = await tx.school.create({
                data: {
                    name: schoolName,
                    createdById: directorId,
                },
            });
            schoolId = school.id;
            const branch = await createBranch(tx, address, principalId, schoolName, school.id);
            if (!branch)
                throw new Error("Error creating branch");
            branchId = branch.id;
            await tx.academicSession.create({
                data: {
                    name: currentSession,
                    branchId: branch.id,
                    isCurrent: true,
                },
            });
        });
        // ---------- File Handling AFTER transaction ----------
        if (file) {
            const uploadDir = path.join("uploads", schoolId, branchId);
            fs.mkdirSync(uploadDir, { recursive: true });
            const ext = path.extname(file.originalname);
            const destPath = path.join(uploadDir, `logo${ext}`);
            fs.renameSync(file.path, destPath);
            // Save logo path in DB
            await prisma.branch.update({
                where: { id: branchId },
                data: { logo: destPath },
            });
        }
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
//# sourceMappingURL=index.js.map