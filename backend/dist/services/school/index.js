import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError } from "@src/lib/utils.js";
import { prisma } from "@src/server.js";
export const getBranchService = async (where, include) => {
    const branch = await prisma.branch.findUnique({ where, include });
    return branch;
};
export const getBranchesService = async (where, include) => {
    const branches = await prisma.branch.findMany({
        where,
        include,
    });
    return branches;
};
export const createCustomFieldService = async (name, label, entityType, type, options, required, branchId, createdById) => {
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
export const getCustomFieldsService = async (where, include) => {
    const data = await prisma.customField.findMany({ where, include });
    return data;
};
export const getCustomFieldService = async (where, include) => {
    const data = await prisma.customField.findFirst({ where, include });
    return data;
};
export const createCustomFieldValue = async (data, tx) => {
    const res = await tx.customFieldValue.create({ data });
    return res;
};
export const getSchoolsService = async (where, include) => {
    const schools = await prisma.school.findMany({ where, include });
    return schools;
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
//# sourceMappingURL=index.js.map