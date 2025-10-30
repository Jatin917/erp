import { error } from "console";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { prisma } from "../../../server.js";
import { connect } from "http2";
import { sendError, sendSuccess } from "../../../lib/utils.js";
import { isEmailVerified } from "../../../services/otp.js";
import { OTP_TYPE } from "../../../lib/types.js";
import { findOrCreateUser } from "../../../services/user/index.js";
export const getAllClass = async (req, res) => {
    try {
        const { branchId, name } = req.query;
        if (!branchId) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: "Please provide branchId", success: false });
        }
        const where = { branchId };
        if (name) {
            where.name = name;
        }
        // Fetch all class labels + related classes + their sections
        const classLabels = await prisma.classLabel.findMany({
            where,
            include: {
                classes: {
                    select: {
                        id: true,
                        section: { select: { id: true, name: true } },
                    },
                },
            },
        });
        // ✅ Group by class name and collect unique section objects
        const grouped = {};
        for (const cls of classLabels) {
            let entry = grouped[cls.name];
            if (!entry) {
                entry = { classId: cls.classes[0]?.id || "", name: cls.name, sections: [] };
                grouped[cls.name] = entry;
            }
            for (const c of cls.classes) {
                if (c.section) {
                    // avoid duplicates
                    if (!entry.sections.find((s) => s.id === c.section.id)) {
                        entry.sections.push({ id: c.section.id, name: c.section.name });
                    }
                }
            }
        }
        const formatted = Object.values(grouped);
        return res
            .status(HTTP_STATUS.OK)
            .json({ message: "Found", success: true, data: { classes: formatted } });
    }
    catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            success: false,
        });
    }
};
export const getAllSections = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        const className = req.query.className;
        const classId = req.query.classId;
        if (!branchId) {
            return res.status(400).json({
                message: "Please provide branchId",
                success: false,
            });
        }
        const where = { branchId };
        // If filtering by classId or className
        if (classId || className) {
            where.classes = {
                some: classId
                    ? { id: classId }
                    : { classLabel: { name: className } },
            };
        }
        const sections = await prisma.section.findMany({
            where,
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
        return res.status(200).json({
            message: "Sections fetched successfully",
            success: true,
            data: { sections },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};
export const createOrUpdateClass = async (req, res) => {
    const { name, branchId, sectionIds } = req.body;
    if (!name || !branchId || !sectionIds?.length) {
        return res.status(400).json({
            message: "Please provide name, branchId and sectionIds",
            success: false,
        });
    }
    try {
        let updatedClasses = [];
        await prisma.$transaction(async (tx) => {
            // 1️⃣ Ensure ClassLabel exists (create if not)
            let classLabel = await tx.classLabel.findFirst({
                where: { name, branchId },
            });
            if (!classLabel) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "No Class Exist with this name" });
            }
            // 2️⃣ Find all existing classes for this classLabel + branch
            const existingClasses = await tx.class.findMany({
                where: { classLabelId: classLabel.id, branchId },
                include: { enrollments: true },
            });
            // 3️⃣ Collect current sectionIds
            const existingSectionIds = existingClasses
                .map((cls) => cls.sectionId)
                .filter((id) => !!id);
            // 4️⃣ Calculate diffs
            const sectionsToAdd = sectionIds.filter((id) => !existingSectionIds.includes(id));
            const sectionsToRemove = existingClasses.filter((cls) => cls.sectionId && !sectionIds.includes(cls.sectionId));
            // 5️⃣ Prevent removing sections that have enrolled students
            const sectionsWithStudents = sectionsToRemove.filter((cls) => cls.enrollments.length > 0);
            if (sectionsWithStudents.length > 0) {
                const ids = sectionsWithStudents.map((cls) => cls.sectionId).join(", ");
                throw new Error(`Cannot remove sections with enrolled students: ${ids}`);
            }
            // 6️⃣ Remove unwanted sections
            if (sectionsToRemove.length > 0) {
                await tx.class.deleteMany({
                    where: { id: { in: sectionsToRemove.map((cls) => cls.id) } },
                });
            }
            // 7️⃣ Add missing sections
            for (const sectionId of sectionsToAdd) {
                const newCls = await tx.class.create({
                    data: {
                        classLabel: { connect: { id: classLabel.id } },
                        branch: { connect: { id: branchId } },
                        section: { connect: { id: sectionId } },
                    },
                    include: { section: true, classLabel: true },
                });
                updatedClasses.push(newCls);
            }
            // Push remaining classes to response
            const stillExisting = await tx.class.findMany({
                where: { classLabelId: classLabel.id, branchId },
                include: { section: true, classLabel: true },
            });
            updatedClasses = [...updatedClasses, ...stillExisting];
        });
        // ✅ Group response by classLabel name
        const grouped = {};
        for (const cls of updatedClasses) {
            const labelName = cls.classLabel?.name;
            if (!labelName)
                continue;
            let entry = grouped[labelName];
            if (!entry) {
                entry = { name: labelName, sections: [] };
                grouped[labelName] = entry;
            }
            if (cls.section) {
                entry.sections.push({ id: cls.section.id, name: cls.section.name });
            }
        }
        return res.status(200).json({
            message: "Class sections synchronized successfully",
            success: true,
            data: { classes: Object.values(grouped) },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            success: false,
        });
    }
};
export const createSection = async (req, res) => {
    try {
        const { name, branchId } = req.body;
        if (!name || !branchId) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Please provide required fields", success: false });
        }
        const section = await prisma.section.create({ data: { name, branch: { connect: { id: branchId } } } });
        return res.status(HTTP_STATUS.CREATED).json({ message: "created section", success: true, data: { name: section.name, id: section.id } });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
export const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!id || !name) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "Section id and name are required" });
        }
        const existing = await prisma.section.findUnique({
            where: { id: String(id) },
        });
        if (!existing) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ success: false, message: "Section not found" });
        }
        const updated = await prisma.section.update({
            where: { id: String(id) },
            data: { name },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Section updated successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: error.message });
    }
};
export const deleteSection = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "Section id is required" });
        }
        const sectionId = String(id);
        // Step 1: Find all classes linked to this section
        const classes = await prisma.class.findMany({
            where: { sectionId },
            select: { id: true },
        });
        // if (!classes.length) {
        //   return res.status(HTTP_STATUS.NOT_FOUND).json({
        //     success: false,
        //     message: "No classes found with this section",
        //   });
        // }
        // Step 2: Check enrollments in those classes
        const classIds = classes.map((c) => c.id);
        const enrollmentCount = await prisma.enrollment.count({
            where: { classId: { in: classIds } },
        });
        if (enrollmentCount > 0) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Cannot delete section with active enrollments in its classes",
            });
        }
        // Step 3: Delete the classes first (since they depend on the section)
        await prisma.class.deleteMany({
            where: { id: { in: classIds } },
        });
        // Step 4: Delete the section
        await prisma.section.delete({
            where: { id: sectionId },
        });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            message: "Section Deleted",
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: error.message });
    }
};
export const getClassNames = async (req, res) => {
    try {
        const { branchId } = req.query;
        if (!branchId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "branchId is required" });
        }
        const classes = await prisma.classLabel.findMany({
            where: { branchId },
            distinct: ["name"], // ✅ ensures unique class names
            select: { name: true },
        });
        // flatten into string array
        const classNames = classes.map(c => c.name);
        res.status(HTTP_STATUS.OK).json({ success: true, message: "Fetched Class Labels", data: { classNames } });
    }
    catch (error) {
        console.error(error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Server error", error: error.message });
    }
};
export const createClassName = async (req, res) => {
    try {
        const { name, branchId } = req.body;
        if (!branchId) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "classLabelId and branchId are required",
                data: null,
            });
        }
        const newClass = await prisma.classLabel.create({
            data: {
                name,
                branch: { connect: { id: branchId } },
            }
        });
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Class created successfully",
            data: { classNames: newClass.name },
        });
    }
    catch (error) {
        console.error("Error creating class:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            data: null,
        });
    }
};
export const createSubject = async (req, res) => {
    try {
        const { classId, name } = req.body;
        if (!classId || !name) {
            return sendError(res, "classId and name are required", HTTP_STATUS.BAD_REQUEST);
        }
        // ✅ Create subject linked to the class
        const subject = await prisma.subject.create({
            data: {
                name,
                class: {
                    connect: { id: classId },
                },
            },
        });
        return sendSuccess(res, "Subject created successfully", subject, HTTP_STATUS.CREATED);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const getSubjects = async (req, res) => {
    try {
        const { classId } = req.params;
        if (!classId) {
            return sendError(res, "classId is required", HTTP_STATUS.BAD_REQUEST);
        }
        const subjects = await prisma.subject.findMany({
            where: { classId },
            orderBy: { createdAt: "desc" },
        });
        return sendSuccess(res, "Subjects fetched successfully", subjects);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const updateSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const { name } = req.body;
        if (!subjectId || !name) {
            return sendError(res, "subjectId and name are required", HTTP_STATUS.BAD_REQUEST);
        }
        const subject = await prisma.subject.update({
            where: { id: subjectId },
            data: { name },
        });
        return sendSuccess(res, "Subject updated successfully", subject);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const deleteSubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        if (!subjectId) {
            return sendError(res, "subjectId is required", HTTP_STATUS.BAD_REQUEST);
        }
        const subjects = await prisma.subject.delete({
            where: { id: subjectId },
            include: { lectures: true }
        });
        if (subjects.lectures.length > 0) {
            return sendError(res, "Cannot Delete Subject having already created lectures", HTTP_STATUS.CONFLICT);
        }
        return sendSuccess(res, "Subject deleted successfully");
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const createFaculty = async (req, res) => {
    try {
        const { name, email, contact, roles, branchId } = req.body;
        if (!name || !email || !roles || !branchId) {
            return sendError(res, "name, email, and role are required", HTTP_STATUS.BAD_REQUEST);
        }
        const success = await isEmailVerified(email, OTP_TYPE.VERIFY_OTP);
        if (success) {
            return sendError(res, "email is not verified", HTTP_STATUS.BAD_REQUEST);
        }
        let user;
        for (const role of roles) {
            user = await findOrCreateUser({ name, email, phone: contact, role });
            if (!user) {
                return sendError(res, "User creation failed", HTTP_STATUS.CONFLICT);
            }
        }
        const faculty = await prisma.schoolFaculty.create({ data: { name, branchId, userid: user.id } });
        if (!faculty) {
            return sendError(res, "Error creating faculty", HTTP_STATUS.BAD_REQUEST);
        }
        return sendSuccess(res, "User created successfully", {}, HTTP_STATUS.CREATED);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const getFaculty = async (req, res) => {
    try {
        const { branchId } = req.query;
        if (!branchId) {
            return sendError(res, "branch id required ", HTTP_STATUS.BAD_REQUEST);
        }
        const faculty = await prisma.schoolFaculty.findMany({ where: { branchId }, include: { user: { select: { role: true, email: true } } } });
        const formattedFaculty = faculty.map(f => {
            return {
                name: f.name,
                email: f.user.email,
                id: f.id,
                roles: f.user.role,
                userid: f.userid
            };
        });
        console.log("faculty is ", faculty, formattedFaculty);
        return sendSuccess(res, "faculty founded", { faculty: formattedFaculty });
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=index.js.map