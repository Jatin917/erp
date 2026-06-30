import type { Prisma } from "../../generated/prisma/index.js";
import { Permission, type Role } from "../../generated/prisma/index.js";
import type { prisma } from "../server.js";
import { roleDefaults } from "./permission.js";

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
