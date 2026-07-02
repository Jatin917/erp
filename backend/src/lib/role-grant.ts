import { Permission, Role } from "../../generated/prisma/index.js";
import { getDefaultPermissionsForRole } from "./apply-role-permissions.js";
import { HTTP_STATUS } from "./http-codes.js";
import { getGrantorEffectivePermissions } from "./permission-grant.js";

const BLOCKED_ASSIGNABLE_ROLES = new Set<Role>([
	Role.SUPERADMIN,
	Role.DIRECTOR,
	Role.PRINCIPAL,
	Role.STUDENT,
	Role.FATHER,
	Role.MOTHER,
]);

export type RoleAssignmentValidationResult =
	| { ok: true }
	| {
			ok: false;
			status: typeof HTTP_STATUS.FORBIDDEN;
			message: string;
	  };

export function canAssignRoles(grantorPermissions: Permission[]): boolean {
	return (
		grantorPermissions.includes(Permission.ALL) ||
		grantorPermissions.includes(Permission.ASSIGN_PERMISSION)
	);
}

export function validateRoleAssignment(params: {
	grantorPermissions: Permission[];
	rolesToAssign: Role[];
}): RoleAssignmentValidationResult {
	const { grantorPermissions, rolesToAssign } = params;

	if (!canAssignRoles(grantorPermissions)) {
		return {
			ok: false,
			status: HTTP_STATUS.FORBIDDEN,
			message: "Not permitted for this task",
		};
	}

	const grantorEffective = getGrantorEffectivePermissions(grantorPermissions);

	for (const role of rolesToAssign) {
		if (BLOCKED_ASSIGNABLE_ROLES.has(role)) {
			return {
				ok: false,
				status: HTTP_STATUS.FORBIDDEN,
				message: "Not permitted for this task",
			};
		}

		for (const permission of getDefaultPermissionsForRole(role)) {
			if (!grantorEffective.has(permission)) {
				return {
					ok: false,
					status: HTTP_STATUS.FORBIDDEN,
					message: "Not permitted for this task",
				};
			}
		}
	}

	return { ok: true };
}