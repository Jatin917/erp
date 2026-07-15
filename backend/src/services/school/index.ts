import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError } from "@src/lib/utils.js";
import { prisma } from "@src/server.js";
import type {
  customFieldType,
  ENTITES,
} from "../../../generated/prisma/index.js";
import type { Prisma } from "@prisma/client/extension";

export const getBranchService = async (where: any, include?: any) => {
  const branch = await prisma.branch.findUnique({ where, include });
  return branch;
};

export const getBranchesService = async (where?: any, include?: any) => {
  const branches = await prisma.branch.findMany({
    where,
    include,
  });
  return branches;
};

export const createCustomFieldService = async (
  name: string,
  label: string,
  entityType: ENTITES,
  type: customFieldType,
  options: string[],
  required: boolean,
  branchId: string,
  createdById: string
) => {
  const data = await prisma.customField.create({
    data: {
      name,
      label,
      entityType,
      type,
      options,
      required,
      branch: { connect: { id: branchId } },
      createdBy: { connect: { id: createdById } },
    },
  });
  return data;
};

export const getCustomFieldsService = async (where?: any, include?: any) => {
  const data = await prisma.customField.findMany({ where, include });
  return data;
};

export const getCustomFieldService = async (where?: any, include?: any) => {
  const data = await prisma.customField.findFirst({ where, include });
  return data;
};

export const createCustomFieldValue = async (
  data: any,
  tx: Prisma.TransactionClient
) => {
  const res = await tx.customFieldValue.create({ data });
  return res;
};

export const getSchoolsService = async (where: any, include?: any) => {
  const schools = await prisma.school.findMany({ where, include });
  return schools;
};

/** Schools matching `where`, each including their branches. */
export const getSchoolsWithBranchesService = async (where: any = {}) => {
  return prisma.school.findMany({
    where,
    include: { branches: true },
  });
};

export async function getLecturesForToday() {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));

  return prisma.lecture.findMany({
    where: {
      schoolDay: {
        date: {
          gte: start,
          lte: end,
        },
      },
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          user: true,
        },
      },
    },
  });
}
