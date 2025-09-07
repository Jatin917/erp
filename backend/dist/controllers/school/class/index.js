import { error } from "console";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { prisma } from "../../../server.js";
import { connect } from "http2";
export const getAllClass = async (req, res) => {
    try {
        const { branchId, name } = req.query;
        if (!branchId) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ message: "Please Provide all branches", success: false });
        }
        const where = { branchId };
        if (name) {
            where.name = name;
        }
        const classes = await prisma.class.findMany({
            where,
            include: {
                section: {
                    select: { id: true, name: true },
                },
            },
        });
        // Transform format
        const formatted = classes
            .filter((cls) => cls.section) // exclude where section is null
            .map((cls) => ({
            classId: cls.id,
            name: cls.name,
            sectionId: cls.section && cls.section.id,
            section: cls.section && cls.section.name,
        }));
        return res
            .status(HTTP_STATUS.OK)
            .json({ message: "Founded", success: true, data: formatted });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            message: error.message,
            success: false,
        });
    }
};
export const getAllSections = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        const classId = req.query.classId; // optional filter
        if (!branchId) {
            return res.status(400).json({
                message: "Please provide branchId",
                success: false,
            });
        }
        // Build the filter
        const where = { branchId };
        if (classId) {
            where.classes = { some: { id: classId } }; // sections that have this class
        }
        const sections = await prisma.section.findMany({
            where,
            select: {
                name: true,
                id: true
            },
            orderBy: { name: "asc" },
        });
        return res.status(200).json({
            message: "Sections fetched successfully",
            success: true,
            data: sections,
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
        await prisma.$transaction(async (tx) => {
            // 1️⃣ Fetch existing class rows for this name and branch with enrollments
            const existingClasses = await tx.class.findMany({
                where: { name, branchId },
                include: { enrollments: true },
            });
            // 2️⃣ Extract valid sectionIds only
            const existingSectionIds = existingClasses
                .map((cls) => cls.sectionId)
                .filter((id) => id !== null && id !== undefined);
            // 3️⃣ Determine sections to add and remove
            const sectionsToAdd = sectionIds.filter((id) => !existingSectionIds.includes(id));
            const sectionsToRemove = existingClasses.filter((cls) => cls.sectionId &&
                !sectionIds.includes(cls.sectionId) &&
                !sectionsToAdd.includes(cls.sectionId));
            // 4️⃣ Check if sections to remove have students
            const sectionsWithStudents = sectionsToRemove.filter((cls) => cls.enrollments.length > 0);
            if (sectionsWithStudents.length > 0) {
                const ids = sectionsWithStudents.map((cls) => cls.sectionId).join(", ");
                throw new Error(`Cannot remove sections with enrolled students: ${ids}`);
            }
            // 5️⃣ Delete old sections (safe to remove)
            if (sectionsToRemove.length > 0) {
                await tx.class.deleteMany({
                    where: { id: { in: sectionsToRemove.map((cls) => cls.id) } },
                });
            }
            // 6️⃣ Create new class-section rows
            for (const sectionId of sectionsToAdd) {
                await tx.class.create({
                    data: {
                        name,
                        branch: { connect: { id: branchId } },
                        section: { connect: { id: sectionId } },
                    },
                });
            }
        });
        return res.status(200).json({
            message: "Class sections synchronized successfully",
            success: true,
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
        const { id } = req.params;
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
        if (!classes.length) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "No classes found with this section",
            });
        }
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
            message: "Section and its empty classes deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: error.message });
    }
};
//# sourceMappingURL=index.js.map