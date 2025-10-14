import { HTTP_STATUS } from "../../lib/http-codes.js";
import { sendError } from "../../lib/utils.js";
import { prisma } from "../../server.js";
export const getBranchService = async (where, include) => {
    const branch = await prisma.branch.findUnique({ where, include });
    return branch;
};
export const getBranchesService = async (where, include) => {
    const branches = await prisma.branch.findMany({
        where, include
    });
    return branches;
};
export const createCustomFieldService = async (name, label, entityType, type, options, required, branchId, createdById) => {
    const data = await prisma.customField.create({
        data: { name, label, entityType, type, options, required, branch: { connect: { id: branchId } }, createdBy: { connect: { id: createdById } } },
    });
    return data;
};
export const getCustomFieldService = async (where, include) => {
    const data = await prisma.customField.findFirst({ where, include });
    return data;
};
export const getSchoolsService = async (where, include) => {
    const schools = await prisma.school.findMany({ where, include });
    return schools;
};
//# sourceMappingURL=index.js.map