import { HTTP_STATUS } from "../../lib/http-codes.js";
import { prisma } from "../../server.js";
export const isPermitted = async (req, res, next) => {
    try {
        console.log("req ", req.body, req.query);
        let userId = null; // Better: use req.user.id from auth middleware
        let task = null;
        if (req.body) {
            userId = req.body.createdBy;
            task = req.body.task;
        }
        else if (req.query) {
            userId = req.query.createdBy;
            task = req.query.task;
        }
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
        console.log("user permissions ", user?.permissions);
        if (!user || !Array.isArray(user.permissions)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "User not found or permissions not set"
            });
        }
        if (user.permissions.includes(task) || user.permissions.includes("ALL")) {
            if (req.body) {
                const { task, createdBy, ...data } = req.body;
                req.body = data;
            }
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