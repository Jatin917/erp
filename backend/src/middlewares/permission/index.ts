import type { NextFunction, Response } from "express";
import { Permission } from "../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";

type PermissionValue = Permission | typeof Permission.ALL;

type RequestUser = {
	permissions?: PermissionValue[];
};

export const requirePermission = (permission: PermissionValue) => {
	return async (req: any, res: Response, next: NextFunction) => {
		try {
			const user = req.user as RequestUser | undefined;

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

			if (permissions.includes(Permission.ALL) || permissions.includes(permission)) {
				return next();
			}

			return res.status(HTTP_STATUS.FORBIDDEN).json({
				success: false,
				message: "Not permitted for this action",
			});
		} catch (error) {
			console.error(error);
			return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
				success: false,
				message: "Something went wrong",
			});
		}
	};
};
