import { prisma } from "@src/server.js"

export const getEnrollment = async (where:any, include:any)=>{
        const enrollment = await prisma.enrollment.findFirst({where, include});
        return enrollment;
}