import { Permission, Role } from "../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../lib/http-codes.js";
import { prisma } from "../../server.js";

export type AccessibleBranches = string[] | "ALL";

type RequestUser = {
	id: string;
	role?: Role[];
	permissions?: Permission[];
};

const SKIP_PATHS = new Set(["/get-schools", "/get-branches"]);

export async function resolveAccessibleBranchIds(user: RequestUser): Promise<AccessibleBranches> {
	if (user.role?.includes(Role.SUPERADMIN) || user.permissions?.includes(Permission.ALL)) {
		return "ALL";
	}

	const branchIds = new Set<string>();

	if (user.role?.includes(Role.DIRECTOR)) {
		const schools = await prisma.school.findMany({
			where: { createdById: user.id },
			select: { branches: { select: { id: true } } },
		});
		for (const school of schools) {
			for (const branch of school.branches) {
				branchIds.add(branch.id);
			}
		}
	}

	if (user.role?.includes(Role.PRINCIPAL)) {
		const principalBranches = await prisma.branch.findMany({
			where: { principalId: user.id },
			select: { id: true },
		});
		for (const branch of principalBranches) {
			branchIds.add(branch.id);
		}
	}

	const faculty = await prisma.schoolFaculty.findUnique({
		where: { userid: user.id },
		select: { branchId: true },
	});
	if (faculty?.branchId) {
		branchIds.add(faculty.branchId);
	}

	const student = await prisma.student.findFirst({
		where: { userId: user.id },
		select: { branchId: true },
	});
	if (student?.branchId) {
		branchIds.add(student.branchId);
	}

	return Array.from(branchIds);
}

export function userCanAccessBranch(accessible: AccessibleBranches, branchId: string): boolean {
	if (accessible === "ALL") return true;
	return accessible.includes(branchId);
}

async function resolveRequestedBranchId(req: any): Promise<string | null> {
	const directBranchId =
		req.body?.branchId || req.query?.branchId || req.params?.branchId || null;
	if (directBranchId) {
		return String(directBranchId);
	}

	const studentId =
		req.params?.studentId || req.body?.studentId || req.query?.studentId || null;
	if (studentId) {
		const student = await prisma.student.findUnique({
			where: { id: String(studentId) },
			select: { branchId: true },
		});
		return student?.branchId ?? null;
	}

	const resourceId = req.params?.id;
	const baseUrl = String(req.baseUrl || "");
	if (resourceId && baseUrl.includes("/student")) {
		const student = await prisma.student.findUnique({
			where: { id: String(resourceId) },
			select: { branchId: true },
		});
		return student?.branchId ?? null;
	}

	return null;
}

export const requireBranchAccess = async (req: any, res: any, next: any) => {
	try {
		const user = req.user as RequestUser | undefined;
		if (!user?.id) {
			return res.status(HTTP_STATUS.UNAUTHORIZED).json({
				success: false,
				message: "Unauthorized",
			});
		}

		const requestPath = String(req.path || "");
		if (SKIP_PATHS.has(requestPath)) {
			return next();
		}

		const branchId = await resolveRequestedBranchId(req);
		if (!branchId) {
			return next();
		}

		if (!req.accessibleBranchIds) {
			req.accessibleBranchIds = await resolveAccessibleBranchIds(user);
		}

		if (!userCanAccessBranch(req.accessibleBranchIds, branchId)) {
			return res.status(HTTP_STATUS.FORBIDDEN).json({
				success: false,
				message: "You do not have access to this branch",
			});
		}

		req.branchId = branchId;
		return next();
	} catch (error) {
		console.error("requireBranchAccess error:", error);
		return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
			success: false,
			message: "Failed to validate branch access",
		});
	}
};