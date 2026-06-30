import { error } from "console";
import { Role as rolesAre, customFieldType } from "../../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { defaultPassword, prisma } from "../../../server.js";
import path from "path";
import bcrypt from 'bcrypt';
import fs from "fs";
import { OTP_TYPE } from "@src/lib/types.js";
import { isEmailVerified } from "@src/services/otp.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { createCustomFieldService, getBranchesService, getBranchService, getCustomFieldsService } from "@src/services/school/index.js";
import { getUserService } from "@src/services/user/index.js";
import { createSchoolDays } from "@src/services/attendance/index.js";
import { syncCustomFieldsToRegistry } from "@src/registry/seed/sync-custom-fields.js";
// Updated createBranch to accept tx for transactions
const createBranch = async (tx, address, principalId, name, schoolId, softwareCharge) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principal: { connect: { id: principalId } },
                name,
                school: { connect: { id: schoolId } },
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
    const file = req.file;
    try {
        const { schoolName, name, currentSession, softwareCharge, startMonthName, endMonthName, } = req.body;
        const director = req.body.directors ? JSON.parse(req.body.directors) : null;
        const principals = req.body.principals ? JSON.parse(req.body.principals) : null;
        const academicMonths = req.body.academicMonths ? JSON.parse(req.body.academicMonths) : [];
        const finalSchoolName = schoolName || name;
        if (!director || !principals || !finalSchoolName || !currentSession || academicMonths.length === 0) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }
        let schoolId = "";
        const branchIds = [];
        await prisma.$transaction(async (tx) => {
            // 1️⃣ Create or find director
            const directorId = await findOrCreateUser("DIRECTOR", director, tx);
            // 2️⃣ Create school
            const school = await tx.school.create({
                data: { name: finalSchoolName, createdById: directorId },
            });
            schoolId = school.id;
            // 3️⃣ Create branches + academic sessions
            for (const principal of principals) {
                const principalId = await findOrCreateUser("PRINCIPAL", principal, tx);
                const branch = await createBranch(tx, principal.branch.address, principalId, finalSchoolName, school.id, softwareCharge);
                if (!branch) {
                    throw new Error("Branch don't exist");
                }
                branchIds.push(branch.id);
                // 🔹 Create academic months first
                const session = await tx.academicSession.create({
                    data: { name: currentSession, branch: { connect: { id: branch.id } }, isCurrent: true },
                });
                const createdMonths = await Promise.all(academicMonths.map((m) => tx.academicMonth.create({
                    data: {
                        name: m.name,
                        startDate: new Date(m.startDate),
                        endDate: new Date(m.endDate),
                        sessionId: session.id,
                    },
                })));
                // 🔹 Link start and end months correctly
                const startMonth = createdMonths.find((m) => m.name === startMonthName);
                const endMonth = createdMonths.find((m) => m.name === endMonthName);
                if (!startMonth || !endMonth)
                    throw new Error("Start or End month not found");
                // 🔹 Create school days within session duration
                await createSchoolDays({
                    tx,
                    sessionId: session.id,
                    startDate: startMonth.startDate,
                    endDate: endMonth.endDate,
                    workingDays: [1, 2, 3, 4, 5, 6],
                });
                // 🔹 Update academic session after month creation
                await tx.academicSession.update({
                    where: { id: session.id },
                    data: {
                        startMonthId: startMonth.id,
                        endMonthId: endMonth.id,
                    },
                });
            }
            if (!file)
                throw new Error("Logo file missing");
        });
        // 4️⃣ File upload (outside transaction)
        for (const branchId of branchIds) {
            const uploadDir = path.join("uploads", schoolId, branchId);
            fs.mkdirSync(uploadDir, { recursive: true });
            const ext = path.extname(file.originalname);
            const destPath = path.join(uploadDir, `logo${ext}`);
            fs.renameSync(file.path, destPath);
            await prisma.branch.update({
                where: { id: branchId },
                data: { logoUrl: destPath },
            });
        }
        res.status(201).json({
            success: true,
            message: "School, branches, session & academic months created successfully",
        });
    }
    catch (error) {
        if (file && fs.existsSync(file.path))
            fs.unlinkSync(file.path);
        res.status(400).json({ success: false, message: error.message });
    }
};
export const getSchools = async (req, res) => {
    try {
        const { email } = req.user; // email of the "guy"
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
                            softwareCharge: true
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
                            softwareCharge: true,
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
            const softwareCharge = branchCount > 0 ? school.branches[0].softwareCharge : 0;
            console.log(school.branches.length, softwareCharge, school.branches);
            return {
                sid: school.id,
                id: school.id, // same as sid
                logo,
                branchCount,
                softwareCharge
            };
        });
        return res.status(200).json({
            success: true,
            message: "Schools fetched successfully",
            data: { schools: formatted },
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
export const deleteSchool = async (req, res) => {
    try {
    }
    catch (error) {
    }
};
export const editSchool = async (req, res) => {
    try {
    }
    catch (error) {
    }
};
export const getBranches = async (req, res) => {
    let { email: createdBy } = req.user;
    if (!createdBy) {
        return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .json({ success: false, message: "Fill required fields" });
    }
    let schools = [];
    try {
        const user = await getUserService({ email: createdBy });
        if (!user) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "User not found" });
        }
        const roles = user.role;
        // SUPERADMIN: return all branches
        if (roles.includes(rolesAre.SUPERADMIN)) {
            const branches = await getBranchesService({}, { academicSession: true });
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
            const foundSchools = await getSchools({ createdById: user.id }, { branches: true });
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
            const foundBranches = await getBranchesService({ principalId: user.id });
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
export const createCustomFields = async (req, res) => {
    try {
        const { name, label, entityType, type, options, required, branchId } = req.body;
        const createdById = req.user.id;
        if (!branchId || !name || !label || !entityType || !type || !createdById) {
            return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
        }
        if ((type === customFieldType.MULTISELECT || type === customFieldType.SELECT || type === customFieldType.RADIO || type === customFieldType.CHECKBOX) && !options) {
            return sendError(res, "Options are required with this fields", HTTP_STATUS.BAD_REQUEST);
        }
        const branch = await getBranchService({ id: branchId });
        if (!branch) {
            return sendError(res, "Branch not found", HTTP_STATUS.NOT_FOUND);
        }
        const alreadyCustomField = await getCustomFieldsService({ name, branchId });
        if (alreadyCustomField.length > 0) {
            return sendError(res, "Custom field with this name already exist", HTTP_STATUS.CONFLICT);
        }
        const customField = await createCustomFieldService(name, label, entityType, type, options, required, branchId, createdById);
        if (!customField) {
            return sendError(res, "Error Creating Custom Field", HTTP_STATUS.SERVICE_UNAVAILABLE);
        }
        await syncCustomFieldsToRegistry();
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data: customField,
        });
    }
    catch (error) {
        console.error("Error creating custom field:", error.message);
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const getCustomFields = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        const entityType = req.query.entityType;
        if (!branchId) {
            return sendError(res, "Missing Fields", HTTP_STATUS.BAD_REQUEST);
        }
        const customFields = await getCustomFieldsService({ branchId, entityType });
        return sendSuccess(res, "Successfully Fetched Data", { fields: customFields }, HTTP_STATUS.OK);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=index.js.map