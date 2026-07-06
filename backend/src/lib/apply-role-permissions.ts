import type { Prisma } from "../../generated/prisma/index.js";
import { Permission, Role } from "../../generated/prisma/index.js";
import type { prisma } from "../server.js";
import { roleDefaults } from "./permission.js";
import { isSchoolFacultyRole } from "./role-grant.js";

export type DbClient = typeof prisma | Prisma.TransactionClient;

export function getDefaultPermissionsForRole(role: Role): Permission[] {
	return roleDefaults[role] ?? [];
}

export function mergeRolePermissions(
	existingPermissions: Permission[],
	role: Role,
): Permission[] {
	if (existingPermissions.includes(Permission.ALL)) {
		return existingPermissions;
	}

	const defaults = getDefaultPermissionsForRole(role);
	return [...new Set([...existingPermissions, ...defaults])];
}

export function getPermissionsForRoles(roles: Role[]): Permission[] {
	let permissions: Permission[] = [];
	for (const role of roles) {
		permissions = mergeRolePermissions(permissions, role);
	}
	return permissions;
}

export async function applyRolePermissions(
	db: DbClient,
	userId: string,
	role: Role,
): Promise<void> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { permissions: true },
	});

	if (!user) {
		return;
	}

	const merged = mergeRolePermissions(user.permissions, role);

	await db.user.update({
		where: { id: userId },
		data: {
			permissions: { set: merged },
		},
	});
}

export type SessionUserRecord = {
	role: Role[];
	permissions: Permission[];
	principalAssignment?: { id: string } | null;
	schoolFaculty?: { branchId: string } | null;
};

export function resolveSessionBranchId(
	requestedBranchId: string | null | undefined,
	user: SessionUserRecord,
): string | null {
	return (
		requestedBranchId ??
		user.principalAssignment?.id ??
		user.schoolFaculty?.branchId ??
		null
	);
}

export function getRolesActiveAtBranch(
	user: SessionUserRecord,
	branchId: string | null,
): Role[] {
	if (user.permissions.includes(Permission.ALL) || user.role.includes(Role.SUPERADMIN)) {
		return [...user.role];
	}

	const active = new Set<Role>();

	for (const role of user.role) {
		if (role === Role.DIRECTOR || role === Role.SUPERADMIN) {
			active.add(role);
			continue;
		}
		if (role === Role.PRINCIPAL) {
			if (branchId && user.principalAssignment?.id === branchId) {
				active.add(role);
			}
			continue;
		}
		if (isSchoolFacultyRole(role)) {
			if (branchId && user.schoolFaculty?.branchId === branchId) {
				active.add(role);
			}
		}
	}

	return Array.from(active);
}

function allRoleDefaultPermissions(roles: Role[]): Set<Permission> {
	const defaults = new Set<Permission>();
	for (const role of roles) {
		for (const permission of getDefaultPermissionsForRole(role)) {
			defaults.add(permission);
		}
	}
	return defaults;
}

export function resolveEffectivePermissions(
	user: SessionUserRecord,
	branchId: string | null,
): Permission[] {
	if (user.permissions.includes(Permission.ALL) || user.role.includes(Role.SUPERADMIN)) {
		return [Permission.ALL];
	}

	const activeRoles = getRolesActiveAtBranch(user, branchId);
	const rolePermissions = getPermissionsForRoles(activeRoles);
	const roleDefaults = allRoleDefaultPermissions(user.role);
	const customGrants = user.permissions.filter((p) => !roleDefaults.has(p));

	return [...new Set<Permission>([...rolePermissions, ...customGrants])];
}

export function resolveEffectiveRoles(
	user: SessionUserRecord,
	branchId: string | null,
): Role[] {
	if (user.permissions.includes(Permission.ALL) || user.role.includes(Role.SUPERADMIN)) {
		return [...user.role];
	}
	return getRolesActiveAtBranch(user, branchId);
}
