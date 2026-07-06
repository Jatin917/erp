import { Permission, Role } from "../../generated/prisma/index.js";
import { getDefaultPermissionsForRole } from "./apply-role-permissions.js";
import { HTTP_STATUS } from "./http-codes.js";
import { getGrantorEffectivePermissions } from "./permission-grant.js";

/** Operational staff roles assigned via SchoolFaculty + createFaculty. */
export const SCHOOL_FACULTY_ROLES: readonly Role[] = [
	Role.TEACHER,
	Role.LIBRARIAN,
	Role.RECEPTIONIST,
	Role.ACCOUNTANT,
	Role.SCHOOL_ADMIN,
] as const;

/** Branch leadership role — assigned via Branch.principalId, branch-scoped like faculty. */
export const BRANCH_LEADER_ROLES: readonly Role[] = [Role.PRINCIPAL] as const;

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

export function isSchoolFacultyRole(role: Role): boolean {
	return (SCHOOL_FACULTY_ROLES as readonly Role[]).includes(role);
}

export function hasAnySchoolFacultyRole(roles: Role[]): boolean {
	return roles.some(isSchoolFacultyRole);
}

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

export type SchoolRoleAssignmentContext = {
	hasSchoolFaculty?: boolean;
	facultyBranchId?: string | null;
	principalBranchId?: string | null;
	targetBranchId?: string;
};

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

function isSameBranch(
	facultyBranchId: string | null | undefined,
	targetBranchId: string | undefined,
): boolean {
	return Boolean(
		facultyBranchId && targetBranchId && facultyBranchId === targetBranchId,
	);
}

export function validateUserEligibleForSchoolRole(
	existingRoles: Role[],
	roleToAssign: Role,
	context: SchoolRoleAssignmentContext | boolean = {},
): RoleSeparationError | null {
	const ctx: SchoolRoleAssignmentContext =
		typeof context === "boolean" ? { hasSchoolFaculty: context } : context;

	const {
		hasSchoolFaculty = false,
		facultyBranchId = null,
		principalBranchId = null,
		targetBranchId,
	} = ctx;

	if (existingRoles.includes(Role.SUPERADMIN)) {
		return {
			message: "Super admin cannot be assigned any additional roles",
		};
	}

	if (existingRoles.includes(Role.DIRECTOR)) {
		if (isSchoolFacultyRole(roleToAssign)) {
			return { message: "Director cannot be assigned school faculty roles" };
		}
		if (roleToAssign === Role.PRINCIPAL) {
			return { message: "Director cannot also be assigned as principal" };
		}
	}

	if (roleToAssign === Role.DIRECTOR) {
		if (hasAnySchoolFacultyRole(existingRoles) || hasSchoolFaculty) {
			return { message: "School faculty cannot be assigned as director" };
		}
		if (existingRoles.includes(Role.PRINCIPAL)) {
			return { message: "Principal cannot also be assigned as director" };
		}
		if (existingRoles.includes(Role.SCHOOL_ADMIN)) {
			return { message: "School admin cannot also be assigned as director" };
		}
	}

	if (existingRoles.includes(Role.PRINCIPAL) && isSchoolFacultyRole(roleToAssign)) {
		if (!principalBranchId || !targetBranchId || principalBranchId !== targetBranchId) {
			return {
				message: "Principal can only be assigned faculty roles at their own branch",
			};
		}
	}

	if (roleToAssign === Role.PRINCIPAL) {
		if (existingRoles.includes(Role.DIRECTOR)) {
			return { message: "Director cannot also be assigned as principal" };
		}
		if (existingRoles.includes(Role.SCHOOL_ADMIN)) {
			return { message: "School admin cannot also be assigned as principal" };
		}
		if (hasAnySchoolFacultyRole(existingRoles)) {
			if (!isSameBranch(facultyBranchId, targetBranchId)) {
				return {
					message: "School faculty cannot be assigned as principal of a different branch",
				};
			}
		}
	}

	if (
		hasSchoolFaculty &&
		(roleToAssign === Role.DIRECTOR || roleToAssign === Role.PRINCIPAL)
	) {
		if (roleToAssign === Role.PRINCIPAL && isSameBranch(facultyBranchId, targetBranchId)) {
			// Faculty at branch X may become principal of the same branch X.
		} else {
			return {
				message: "School staff cannot be assigned as director or principal",
			};
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

export function validateDirectorCannotJoinFaculty(
	existingRoles: Role[],
): RoleSeparationError | null {
	if (existingRoles.includes(Role.DIRECTOR)) {
		return { message: "Director cannot be assigned as school faculty" };
	}
	return null;
}

export function validateFacultyRoleList(
	roles: Role[],
	context: SchoolRoleAssignmentContext & { existingRoles: Role[] },
): RoleSeparationError | null {
	const directorError = validateDirectorCannotJoinFaculty(context.existingRoles);
	if (directorError) {
		return directorError;
	}

	const branchError = validateFacultyBranchAssignment(context);
	if (branchError) {
		return branchError;
	}

	for (const role of roles) {
		const error = validateUserEligibleForSchoolRole(context.existingRoles, role, context);
		if (error) {
			return error;
		}
	}

	return null;
}

export function validateFacultyBranchAssignment(
	context: SchoolRoleAssignmentContext & { existingRoles: Role[] },
): RoleSeparationError | null {
	const {
		existingRoles,
		principalBranchId = null,
		facultyBranchId = null,
		targetBranchId,
	} = context;

	if (!targetBranchId) {
		return null;
	}

	if (existingRoles.includes(Role.PRINCIPAL)) {
		if (!principalBranchId || principalBranchId !== targetBranchId) {
			return {
				message: "Principal can only be school faculty at their own branch",
			};
		}
	}

	if (facultyBranchId && facultyBranchId !== targetBranchId) {
		return {
			message: "User is already assigned as faculty to another branch",
		};
	}

	return null;
}
