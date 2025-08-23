import { error } from "console";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { prisma } from "../../../server.js";
import { connect } from "http2";
export const getAllClass = async (req, res) => {
    try {
        const branchId = req.query.branchId;
        if (!branchId) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({ message: "Please Provide all branches", success: false });
        }
        const classes = await prisma.class.findMany({ where: { branchId } });
        return res.status(HTTP_STATUS.OK).json({ message: "Founded ", success: true });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
export const createClass = async (req, res) => {
    const { name, branchId, sectionIds } = req.body; // plural because can be many
    try {
        if (!name || !branchId) {
            return res.status(400).json({
                message: "Please provide name and branchId",
                success: false,
            });
        }
        const newClass = await prisma.class.create({
            data: {
                name,
                branch: { connect: { id: branchId } },
                section: sectionIds
                    ? {
                        connect: sectionIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: { section: true },
        });
        return res.status(201).json({
            message: "Created Class",
            success: true,
            data: newClass,
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
        return res.status(HTTP_STATUS.CREATED).json({ message: "created section", success: true });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message, success: false });
    }
};
//# sourceMappingURL=index.js.map