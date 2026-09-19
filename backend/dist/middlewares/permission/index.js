import { Permission } from "../../../generated/prisma/index.js";
import { resolveRequestEffectivePermissions } from "../../lib/apply-role-permissions.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";
const userHasAnyPermission = (userPermissions, required) => {
    if (userPermissions.includes(Permission.ALL)) {
        return true;
    }
    return required.some((permission) => userPermissions.includes(permission));
};
/**
 * Permissions the user actually holds for this request, scoped to the
 * request's branch (req.branchId, validated by requireBranchAccess) or the
 * user's home branch. Prevents e.g. a PRINCIPAL of branch A who is also a
 * TEACHER at branch B from using principal-level permissions at branch B.
 */
const getEffectivePermissions = (req, user) => {
    return resolveRequestEffectivePermissions({
        role: user.role ?? [],
        permissions: (user.permissions ?? []),
        principalAssignment: user.principalAssignment ?? null,
        schoolFaculty: user.schoolFaculty ?? null,
    }, req.branchId ?? null);
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
            if (!Array.isArray(user.permissions)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: "Permissions not set",
                });
            }
            const permissions = getEffectivePermissions(req, user);
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
            if (!Array.isArray(user.permissions)) {
                return res.status(HTTP_STATUS.FORBIDDEN).json({
                    success: false,
                    message: "Permissions not set",
                });
            }
            const permissions = getEffectivePermissions(req, user);
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