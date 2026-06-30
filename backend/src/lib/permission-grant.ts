import { Permission } from "../../generated/prisma/index.js";
import { HTTP_STATUS } from "./http-codes.js";

const ALL_GRANULAR_PERMISSIONS = Object.values(Permission).filter(
	(p) => p !== Permission.ALL,
);

export function isAllAdmin(grantorPermissions: Permission[]): boolean {
	return grantorPermissions.includes(Permission.ALL);
}

export function getGrantorEffectivePermissions(
	grantorPermissions: Permission[],
): Set<Permission> {
	if (isAllAdmin(grantorPermissions)) {
		return new Set(ALL_GRANULAR_PERMISSIONS);
	}
	return new Set(grantorPermissions);
}

export type GrantValidationResult =
	| { ok: true; allowSet: Permission[]; denySet: Permission[] }
	| {
			ok: false;
			status: typeof HTTP_STATUS.BAD_REQUEST | typeof HTTP_STATUS.FORBIDDEN;
			message: string;
	  };

function parsePermissionList(input: unknown): string[] {
	if (!Array.isArray(input)) {
		return [];
	}
	return input.filter((p): p is string => typeof p === "string" && Boolean(p));
}

export function validatePermissionGrant(params: {
	grantorPermissions: Permission[];
	grantorUserId: string;
	targetUserId: string;
	permissionsToAllow: unknown;
	permissionsToDeny: unknown;
}): GrantValidationResult {
	const {
		grantorPermissions,
		grantorUserId,
		targetUserId,
		permissionsToAllow,
		permissionsToDeny,
	} = params;

	if (targetUserId === grantorUserId) {
		return {
			ok: false,
			status: HTTP_STATUS.FORBIDDEN,
			message: "Cannot modify your own permissions via this endpoint",
		};
	}

	const allowRaw = parsePermissionList(permissionsToAllow);
	const denyRaw = parsePermissionList(permissionsToDeny);
	const validValues = new Set(Object.values(Permission));

	for (const p of [...allowRaw, ...denyRaw]) {
		if (!validValues.has(p as Permission)) {
			return {
				ok: false,
				status: HTTP_STATUS.BAD_REQUEST,
				message: `Invalid permission: ${p}`,
			};
		}
	}

	const allowSet = allowRaw as Permission[];
	const denySet = denyRaw as Permission[];

	const overlap = allowSet.filter((p) => denySet.includes(p));
	if (overlap.length > 0) {
		return {
			ok: false,
			status: HTTP_STATUS.BAD_REQUEST,
			message: "Permission cannot be both allowed and denied",
		};
	}

	if (allowSet.includes(Permission.ALL)) {
		return {
			ok: false,
			status: HTTP_STATUS.FORBIDDEN,
			message: "ALL permission cannot be assigned to other users",
		};
	}

	const grantorIsAllAdmin = isAllAdmin(grantorPermissions);
	const grantorEffective = getGrantorEffectivePermissions(grantorPermissions);

	for (const p of allowSet) {
		if (p === Permission.ASSIGN_PERMISSION && !grantorIsAllAdmin) {
			return {
				ok: false,
				status: HTTP_STATUS.FORBIDDEN,
				message: "Only the admin can grant ASSIGN_PERMISSION",
			};
		}
		if (!grantorEffective.has(p)) {
			return {
				ok: false,
				status: HTTP_STATUS.FORBIDDEN,
				message: `Cannot grant permission you do not hold: ${p}`,
			};
		}
	}

	for (const p of denySet) {
		if (!grantorEffective.has(p)) {
			return {
				ok: false,
				status: HTTP_STATUS.FORBIDDEN,
				message: `Cannot revoke permission you do not hold: ${p}`,
			};
		}
	}

	return { ok: true, allowSet, denySet };
}
