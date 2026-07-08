import { Permission, Role } from "../../../generated/prisma/index.js";
import { resolveRequestEffectivePermissions } from "../../lib/apply-role-permissions.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";
import { validatePermissionGrant } from "../../lib/permission-grant.js";
import {
	resolveAccessibleBranchIds,
	userCanAccessBranch,
} from "../../middlewares/branch-access/index.js";
import { prisma } from "../../server.js";

/**
 * A grantor may only view/modify permissions of users that belong to one of
 * the grantor's accessible branches. ALL-admins and SUPERADMINs are exempt.
 */
async function targetUserInGrantorScope(
	req: any,
	targetUserId: string,
): Promise<boolean> {
	const grantor = req.user;
	if (
		grantor.permissions?.includes(Permission.ALL) ||
		grantor.role?.includes(Role.SUPERADMIN)
	) {
		return true;
	}

	if (!req.accessibleBranchIds) {
		req.accessibleBranchIds = await resolveAccessibleBranchIds(grantor);
	}

	const target = await prisma.user.findUnique({
		where: { id: targetUserId },
		select: {
			schoolFaculty: { select: { branchId: true } },
			principalAssignment: { select: { id: true } },
			studentProfile: { select: { branchId: true } },
			directorSchools: { select: { branches: { select: { id: true } } } },
		},
	});
	if (!target) {
		return false;
	}

	const targetBranchIds = new Set<string>();
	if (target.schoolFaculty?.branchId) targetBranchIds.add(target.schoolFaculty.branchId);
	if (target.principalAssignment?.id) targetBranchIds.add(target.principalAssignment.id);
	if (target.studentProfile?.branchId) targetBranchIds.add(target.studentProfile.branchId);
	for (const school of target.directorSchools) {
		for (const branch of school.branches) {
			targetBranchIds.add(branch.id);
		}
	}

	return Array.from(targetBranchIds).some((branchId) =>
		userCanAccessBranch(req.accessibleBranchIds, branchId),
	);
}

function getGrantorEffective(req: any): Permission[] {
	const grantor = req.user;
	return resolveRequestEffectivePermissions(
		{
			role: grantor.role ?? [],
			permissions: grantor.permissions ?? [],
			principalAssignment: grantor.principalAssignment ?? null,
			schoolFaculty: grantor.schoolFaculty ?? null,
		},
		req.branchId ?? null,
	);
}

export const permitPermission = async (req: any, res: any) => {
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

		if (!(await targetUserInGrantorScope(req, permissionToWhomId))) {
			return res
				.status(HTTP_STATUS.FORBIDDEN)
				.json({ success: false, message: "Not permitted for this task" });
		}

		const validation = validatePermissionGrant({
			grantorPermissions: getGrantorEffective(req),
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
	} catch (error) {
		console.error("Error updating permissions:", error);
		return res
			.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.json({ success: false, message: "Internal server error" });
	}
};

export const getUserPermissions = async (req: any, res: any) => {
	try {
		const { userId } = req.params;
		if (!userId) {
			return res
				.status(HTTP_STATUS.BAD_REQUEST)
				.json({ success: false, message: "User ID is required" });
		}

		if (!(await targetUserInGrantorScope(req, userId))) {
			return res
				.status(HTTP_STATUS.FORBIDDEN)
				.json({ success: false, message: "Not permitted for this task" });
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				email: true,
				permissions: true,
				role: true,
			},
		});

		if (!user) {
			return res
				.status(HTTP_STATUS.NOT_FOUND)
				.json({ success: false, message: "User not found" });
		}

		return res.json({
			success: true,
			message: "User permissions fetched",
			data: { user },
		});
	} catch (error) {
		console.error("Error fetching user permissions:", error);
		return res
			.status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
			.json({ success: false, message: "Internal server error" });
	}
};
