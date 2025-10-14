import { prisma } from "../../server.js";
export const getUserService = async (where, include) => {
    const user = await prisma.user.findFirst({
        where,
        include
    });
    return user;
};
//# sourceMappingURL=index.js.map