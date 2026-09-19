import { error } from "console";
import { Role as rolesAre } from "../../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { defaultPassword, prisma } from "../../../server.js";
import path from "path";
import bcrypt from 'bcrypt';
import fs from "fs";
import { OTP_TYPE } from "../../../lib/types.js";
import { isEmailVerified } from "../../../services/otp.js";
import { sendError, sendSuccess } from "../../../lib/utils.js";
import { createCustomFieldService, customFieldRequiresOptions, getBranchesService, getBranchService, getCustomFieldService, getCustomFieldsService, getSchoolsWithBranchesService, normalizeCustomFieldOptions, updateCustomFieldService } from "../../../services/school/index.js";
import { getUserService } from "../../../services/user/index.js";
import { createSchoolDays } from "../../../services/attendance/index.js";
import { customFieldRegistryKey, syncCustomFieldToRegistry } from "../../../registry/seed/sync-custom-fields.js";
import { mergeRolePermissions } from "../../../lib/apply-role-permissions.js";
import { normalizeEmail, SCHOOL_FACULTY_ROLES, validateDistinctDirectorAndPrincipals, validateNoSelfAssignment, } from "../../../lib/role-grant.js";
const formatBranchOption = (branch) => ({
    name: `${branch.name} ${branch.address}`,
    id: branch.id,
    logo: branch.logoUrl,
    ...(branch.softwareCharge !== undefined ? { softwareCharge: branch.softwareCharge } : {}),
});
// Helper: create a branch inside an existing transaction
const createBranch = async (tx, address, principalId, name, schoolId) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principal: { connect: { id: principalId } },
                name,
                school: { connect: { id: schoolId } },
                address,
                // softwareCharge is omitted here; Prisma schema sets it to default 0
            },
        });
        return branch;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
// ---------- Helper: director/principal must be brand-new users ----------
const createNewLeadershipUser = async (role, userData, tx) => {
    const existingUser = await tx.user.findUnique({
        where: { email: userData.email },
        select: { id: true },
    });
    if (existingUser) {
        throw new Error(`${role} must be a new user. An account already exists for ${userData.email}.`);
    }
    const verified = await isEmailVerified(userData.email, OTP_TYPE.VERIFY_OTP);
    if (!verified) {
        throw new Error(`${role} email is not verified. Please verify first.`);
    }
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const newUser = await tx.user.create({
        data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: [role],
            isEmailVerified: true,
            isPhoneVerified: false,
            phone: userData.contact,
            permissions: { set: mergeRolePermissions([], role) },
        },
    });
    return newUser.id;
};
export const createSchool = async (req, res) => {
    const file = req.file;
    try {
        const { schoolName, name, currentSession, startMonthName, endMonthName, } = req.body;
        const director = req.body.directors ? JSON.parse(req.body.directors) : null;
        const principals = req.body.principals ? JSON.parse(req.body.principals) : null;
        const academicMonths = req.body.academicMonths ? JSON.parse(req.body.academicMonths) : [];
        const finalSchoolName = schoolName || name;
        if (!director || !principals || !finalSchoolName || !currentSession || academicMonths.length === 0) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }
        const directorEmail = director.email?.trim();
        const principalEmails = principals
            .map((p) => p.email?.trim())
            .filter(Boolean);
        if (!directorEmail || principalEmails.length !== principals.length) {
            return res.status(400).json({ success: false, message: "Director and principal emails are required" });
        }
        const selfAssignmentError = validateNoSelfAssignment(req.user?.email, [
            directorEmail,
            ...principalEmails,
        ]);
        if (selfAssignmentError) {
            return res.status(400).json({ success: false, message: selfAssignmentError.message });
        }
        const roleSeparationError = validateDistinctDirectorAndPrincipals(directorEmail, principalEmails);
        if (roleSeparationError) {
            return res.status(400).json({ success: false, message: roleSeparationError.message });
        }
        const existingUsers = await prisma.user.findMany({
            where: {
                OR: [directorEmail, ...principalEmails].map((email) => ({
                    email: { equals: email, mode: "insensitive" },
                })),
            },
            select: { email: true },
        });
        if (existingUsers.length > 0) {
            const emails = existingUsers.map((u) => u.email).join(", ");
            return res.status(400).json({
                success: false,
                message: `Director and principal must be new users. Account already exists for: ${emails}`,
            });
        }
        let schoolId = "";
        const branchIds = [];
        await prisma.$transaction(async (tx) => {
            // 1️⃣ Create director (new user only)
            const directorId = await createNewLeadershipUser("DIRECTOR", director, tx);
            // Block duplicate: same director + school name + principal
            const normalizedPrincipalEmails = principalEmails.map((email) => normalizeEmail(email));
            const existingSchool = await tx.school.findFirst({
                where: {
                    name: { equals: finalSchoolName.trim(), mode: "insensitive" },
                    createdById: directorId,
                },
                include: {
                    branches: {
                        include: {
                            principal: { select: { email: true } },
                        },
                    },
                },
            });
            if (existingSchool && normalizedPrincipalEmails.length > 0) {
                const existingPrincipalEmails = new Set(existingSchool.branches
                    .map((b) => b.principal?.email?.trim().toLowerCase())
                    .filter(Boolean));
                const duplicatePrincipal = normalizedPrincipalEmails.find((email) => existingPrincipalEmails.has(email));
                if (duplicatePrincipal) {
                    throw new Error(`A school named "${finalSchoolName}" with this director and principal already exists.`);
                }
            }
            // 2️⃣ Create school
            const school = await tx.school.create({
                data: { name: finalSchoolName, createdById: directorId },
            });
            schoolId = school.id;
            // 3️⃣ Create branches + academic sessions (+ register principals as school faculty)
            for (const principal of principals) {
                const principalId = await createNewLeadershipUser("PRINCIPAL", principal, tx);
                const branch = await createBranch(tx, principal.branch.address, principalId, finalSchoolName, school.id);
                if (!branch) {
                    throw new Error("Branch don't exist");
                }
                branchIds.push(branch.id);
                // Also register principal as school faculty for this branch
                await tx.schoolFaculty.create({
                    data: {
                        userId: principalId,
                        name: principal.name,
                        branchId: branch.id,
                    },
                });
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
        console.log("req.user", req.user);
        const { email } = req.user; // email of the "guy"
        console.log("email is ", email);
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
            schools = branches.map((branch) => formatBranchOption(branch));
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Found All Branches",
                data: { schools },
            });
        }
        // DIRECTOR: get schools + their branches
        if (roles.includes(rolesAre.DIRECTOR)) {
            const foundSchools = await getSchoolsWithBranchesService({ createdById: user.id });
            // Flatten all branches from all schools and format them
            foundSchools.forEach((school) => {
                if (school.branches?.length) {
                    school.branches.forEach((branch) => {
                        schools.push(formatBranchOption(branch));
                    });
                }
            });
        }
        // PRINCIPAL: get branches directly assigned
        if (roles.includes(rolesAre.PRINCIPAL)) {
            const foundBranches = await getBranchesService({ principalId: user.id });
            schools = foundBranches.map((branch) => formatBranchOption(branch));
        }
        const hasSchoolFacultyRole = roles.some((role) => SCHOOL_FACULTY_ROLES.includes(role));
        if (hasSchoolFacultyRole && schools.length === 0) {
            const faculty = await prisma.schoolFaculty.findUnique({
                where: { userId: user.id },
                include: { branch: true },
            });
            if (faculty?.branch) {
                schools = [formatBranchOption(faculty.branch)];
            }
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
        const normalizedOptions = normalizeCustomFieldOptions(options);
        if (customFieldRequiresOptions(type) && normalizedOptions.length === 0) {
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
        const customField = await createCustomFieldService(name, label, entityType, type, normalizedOptions, required, branchId, createdById);
        if (!customField) {
            return sendError(res, "Error Creating Custom Field", HTTP_STATUS.SERVICE_UNAVAILABLE);
        }
        await syncCustomFieldToRegistry(customField);
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
export const updateCustomFields = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, label, entityType, type, options, required, branchId } = req.body;
        if (!id || !name || !label || !type) {
            return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
        }
        const existing = await getCustomFieldService({ id: String(id) });
        if (!existing) {
            return sendError(res, "Custom field not found", HTTP_STATUS.NOT_FOUND);
        }
        if (!req.branchId || String(req.branchId) !== existing.branchId) {
            return sendError(res, "You do not have access to this branch", HTTP_STATUS.FORBIDDEN);
        }
        if (branchId && String(branchId) !== existing.branchId) {
            return sendError(res, "Custom field does not belong to this branch", HTTP_STATUS.FORBIDDEN);
        }
        if (entityType && entityType !== existing.entityType) {
            return sendError(res, "Entity type cannot be changed", HTTP_STATUS.BAD_REQUEST);
        }
        const normalizedOptions = normalizeCustomFieldOptions(options);
        if (customFieldRequiresOptions(type) && normalizedOptions.length === 0) {
            return sendError(res, "Options are required with this fields", HTTP_STATUS.BAD_REQUEST);
        }
        const nameConflict = await getCustomFieldsService({
            name,
            branchId: existing.branchId,
            id: { not: existing.id },
        });
        if (nameConflict.length > 0) {
            return sendError(res, "Custom field with this name already exist", HTTP_STATUS.CONFLICT);
        }
        const previousFieldKey = customFieldRegistryKey(existing.entityType, existing.name);
        const customField = await updateCustomFieldService(existing.id, {
            name,
            label,
            type,
            options: normalizedOptions,
            required: Boolean(required),
        });
        await syncCustomFieldToRegistry(customField, previousFieldKey);
        return sendSuccess(res, "Custom field updated successfully", customField, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        console.error("Error updating custom field:", message);
        if (message === "A report field with this name already exists") {
            return sendError(res, message, HTTP_STATUS.CONFLICT);
        }
        return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=index.js.map