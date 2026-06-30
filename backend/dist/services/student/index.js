import { prisma } from "@src/server.js";
export const getEnrollment = async (where, include) => {
    const enrollment = await prisma.enrollment.findFirst({ where, include });
    return enrollment;
};
//# sourceMappingURL=index.js.map