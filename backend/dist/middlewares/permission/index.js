import { Permission } from "../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";
const userHasAnyPermission = (userPermissions, required) => {
    if (userPermissions.includes(Permission.ALL)) {
        return true;
    }
    return required.some((permission) => userPermissions.includes(permission));
};
export const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const permissions = user.permissions;
            if (!Array.isArray(permissions)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: "Permissions not set",
                });
            }
            if (userHasAnyPermission(permissions, [permission])) {
                return next();
            }
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Not permitted for this action",
            });
        }
        catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };
};
export const requireAnyPermission = (...required) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const permissions = user.permissions;
            if (!Array.isArray(permissions)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: "Permissions not set",
                });
            }
            if (userHasAnyPermission(permissions, required)) {
                return next();
            }
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Not permitted for this action",
            });
        }
        catch (error) {
            console.error(error);
            return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };
};
//# sourceMappingURL=index.js.map