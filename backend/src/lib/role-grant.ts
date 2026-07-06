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

export type RoleSeparationError = { message: string };

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function validateNoSelfAssignment(
	actorEmail: string | undefined,
	assigneeEmails: string[],
): RoleSeparationError | null {
	if (!actorEmail) {
		return null;
	}

	const actor = normalizeEmail(actorEmail);
	for (const email of assigneeEmails) {
		if (email && normalizeEmail(email) === actor) {
			return {
				message: "You cannot assign yourself as director or principal",
			};
		}
	}

	return null;
}

export function validateDistinctDirectorAndPrincipals(
	directorEmail: string,
	principalEmails: string[],
): RoleSeparationError | null {
	const director = normalizeEmail(directorEmail);
	const seen = new Set<string>();

	for (const email of principalEmails) {
		const normalized = normalizeEmail(email);
		if (normalized === director) {
			return {
				message: "Director and principal must be different people",
			};
		}
		if (seen.has(normalized)) {
			return {
				message: "Each principal must have a unique email",
			};
		}
		seen.add(normalized);
	}

	return null;
}

export function validateUserEligibleForSchoolRole(
	existingRoles: Role[],
	roleToAssign: Role,
	hasSchoolFaculty: boolean,
): RoleSeparationError | null {
	if (existingRoles.includes(Role.SUPERADMIN)) {
		return {
			message: "Super admin cannot be assigned as director, principal, or school admin",
		};
	}

	if (hasSchoolFaculty && (roleToAssign === Role.DIRECTOR || roleToAssign === Role.PRINCIPAL)) {
		return {
			message: "School staff cannot be assigned as director or principal",
		};
	}

	if (roleToAssign === Role.DIRECTOR) {
		if (existingRoles.includes(Role.PRINCIPAL)) {
			return { message: "Principal cannot also be assigned as director" };
		}
		if (existingRoles.includes(Role.SCHOOL_ADMIN)) {
			return { message: "School admin cannot also be assigned as director" };
		}
	}

	if (roleToAssign === Role.PRINCIPAL) {
		if (existingRoles.includes(Role.DIRECTOR)) {
			return { message: "Director cannot also be assigned as principal" };
		}
		if (existingRoles.includes(Role.SCHOOL_ADMIN)) {
			return { message: "School admin cannot also be assigned as principal" };
		}
	}

	if (roleToAssign === Role.SCHOOL_ADMIN) {
		if (existingRoles.includes(Role.DIRECTOR)) {
			return { message: "Director cannot also be assigned as school admin" };
		}
		if (existingRoles.includes(Role.PRINCIPAL)) {
			return { message: "Principal cannot also be assigned as school admin" };
		}
	}

	return null;
}