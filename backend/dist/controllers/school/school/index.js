import { error } from "console";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { prisma } from "../../../server.js";
// Updated createBranch to accept tx for transactions
const createBranch = async (tx, address, principalId, name, schoolId) => {
    try {
        const branch = await tx.branch.create({
            data: {
                principalId,
                name,
                schoolId,
                address
            }
        });
        return branch;
    }
    catch (error) {
        console.log(error);
        return null;
    }
};
export const createSchool = async (req, res) => {
    try {
        const { name, address, createdById, principalId, currentSession } = req.body;
        await prisma.$transaction(async (tx) => {
            // Step 1: Create the school
            const school = await tx.school.create({
                data: {
                    name,
                    createdById
                }
            });
            // Step 2: Use createBranch function
            const branch = await createBranch(tx, address, principalId ?? createdById, name, // branch name same as school name
            school.id);
            if (!branch)
                throw new Error("error creating branch");
            await tx.academicSession.create({ data: { name: currentSession, branchId: branch.id, isCurrent: true } });
        });
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Created School with default branch"
        });
    }
    catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};
//# sourceMappingURL=index.js.map