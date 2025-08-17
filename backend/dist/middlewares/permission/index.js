import { HTTP_STATUS } from "../../lib/http-codes.js";
import { prisma } from "../../server.js";
export const isPermitted = async (req, res, next) => {
    try {
        console.log("req ", req.body);
        const userId = req.body.createdBy; // Better: use req.user.id from auth middleware
        const task = req.body.task;
        console.log("isPermitted ", userId, task);
        if (!userId || !task) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "User ID and task are required"
            });
        }
        const user = await prisma.user.findFirst({
            where: { email: userId },
            select: { permissions: true }
        });
        if (!user || !Array.isArray(user.permissions)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "User not found or permissions not set"
            });
        }
        if (user.permissions.includes(task) || user.permissions.includes("ALL")) {
            const { task, createdBy, ...data } = req.body;
            req.body = data;
            return next(); // ✅ Stop execution after calling next()
        }
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: "Not permitted for this task"
        });
    }
    catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
//# sourceMappingURL=index.js.map