import { HTTP_STATUS } from "../../lib/http-codes.js";
import { prisma } from "../../server.js";

export const isPermitted = async (req:any, res:any, next:any) => {
    try {
        const userId =
            req.user?.email ||
            req.body?.createdBy ||
            req.query?.createdBy ||
            null;
        let task = null;
        if(req.body){
            task = req.body.task;
        }
        else if(req.query) task = req.query.task;
        if (!userId || !task) {
            console.log("yha aaya then")
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
            if(req.body){
                const {task, createdBy, ...data} = req.body;
                req.body = data;
            }
            return next(); // ✅ Stop execution after calling next()
        }
        return res.status(HTTP_STATUS.FORBIDDEN).json({
            success: false,
            message: "Not permitted for this task"
        });
    } catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
