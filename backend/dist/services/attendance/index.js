import { prisma } from "../../server.js";
import { SchoolDayType } from "../../../generated/prisma/index.js";
export const createSchoolDays = async ({ tx, sessionId, startDate, endDate, workingDays }) => {
    try {
        // const { sessionId, startDate, endDate, workingDays } = ;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const day = d.getDay(); // 0=Sun, 6=Sat
            const type = !workingDays.includes(day) ? SchoolDayType.NON_WORKING : SchoolDayType.WORKING;
            days.push({ date: new Date(d), sessionId, type });
        }
        await tx.schoolDay.createMany({ data: days });
        return { success: true, total: days.length };
    }
    catch (err) {
        return null;
    }
};
//# sourceMappingURL=index.js.map