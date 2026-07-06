import type { Prisma } from "@prisma/client/extension";
import { defaultPassword, prisma } from "@src/server.js";
import bcrypt from "bcrypt";
import { applyRolePermissions, mergeRolePermissions } from "@src/lib/apply-role-permissions.js";
import {
	type SchoolRoleAssignmentContext,
	validateUserEligibleForSchoolRole,
} from "@src/lib/role-grant.js";
import type { Role } from "../../../generated/prisma/index.js";


export const getUserService = async (where:any, include?:any) =>{
    const user =  await prisma.user.findFirst({
    where,
    include
  });
  return user;
}


export async function findOrCreateUser(
  {
    name,
    email,
    phone,
    role,
    tx,
    targetBranchId,
  }: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    tx?: Prisma.TransactionClient;
    targetBranchId?: string;
  }
) {
  const db = tx || prisma;

  if (!email) return null;

  let user = await db.user.findFirst({
    where: { OR: [{ email }, { phone }] },
    include: {
      schoolFaculty: { select: { branchId: true } },
      principalAssignment: { select: { id: true } },
    },
  });

  if (user) {
    const roleContext: SchoolRoleAssignmentContext = {
      hasSchoolFaculty: Boolean(user.schoolFaculty),
      facultyBranchId: user.schoolFaculty?.branchId ?? null,
      principalBranchId: user.principalAssignment?.id ?? null,
    };
    if (targetBranchId) {
      roleContext.targetBranchId = targetBranchId;
    }
    const eligibilityError = validateUserEligibleForSchoolRole(
      user.role,
      role,
      roleContext,
    );
    if (eligibilityError) {
      throw new Error(eligibilityError.message);
    }

    if (!user.role.includes(role)) {
      user = await db.user.update({
        where: { id: user.id },
        data: { role: { push: role } },
      });
    }
    await applyRolePermissions(db, user.id, role);
    return user;
  }

  const hashedPwd = await bcrypt.hash(defaultPassword, 10);

  return db.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPwd,
      role: [role],
      isEmailVerified: false,
      isPhoneVerified: false,
      permissions: { set: mergeRolePermissions([], role) },
    },
  });
}
