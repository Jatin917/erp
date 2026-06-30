import { Permission } from "../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";
import { validatePermissionGrant } from "../../lib/permission-grant.js";
import { prisma } from "../../server.js";
export const permitPermission = async (req, res) => {
    try {
        const { permissionToWhomId, permissionsToAllow, permissionsToDeny } = req.body;
        if (!permissionToWhomId) {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ success: false, message: "User ID is required" });
        }
        const grantor = req.user;
        if (!grantor?.id || !Array.isArray(grantor.permissions)) {
            return res
                .status(HTTP_STATUS.UNAUTHORIZED)
                .json({ success: false, message: "Unauthorized" });
        }
        const validation = validatePermissionGrant({
            grantorPermissions: grantor.permissions,
            grantorUserId: grantor.id,
            targetUserId: permissionToWhomId,
            permissionsToAllow,
            permissionsToDeny,
        });
        if (!validation.ok) {
            return res
                .status(validation.status)
                .json({ success: false, message: validation.message });
        }
        const user = await prisma.user.findUnique({
            where: { id: permissionToWhomId },
            select: { permissions: true },
        });
        if (!user) {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ success: false, message: "User not found" });
        }
        const updatedPermissions = new Set(user.permissions || []);
        validation.allowSet.forEach((p) => updatedPermissions.add(p));
        validation.denySet.forEach((p) => updatedPermissions.delete(p));
        await prisma.user.update({
            where: { id: permissionToWhomId },
            data: {
                permissions: {
                    set: Array.from(updatedPermissions),
                },
            },
        });
        return res.json({
            success: true,
            message: "Permissions updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating permissions:", error);
        return res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ success: false, message: "Internal server error" });
    }
};
//# sourceMappingURL=index.js.map