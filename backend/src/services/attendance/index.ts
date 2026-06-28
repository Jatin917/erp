import { prisma } from "@src/server.js";
import { SchoolDayType } from "../../../generated/prisma/index.js";
import type { Prisma } from "@prisma/client/extension";

export const createSchoolDays = async ({tx, sessionId, startDate, endDate, workingDays}:{tx:Prisma.TransactionClient, sessionId:string, startDate:Date, endDate:Date, workingDays:number[]}) => {
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
    
  } catch (err: any) {
    return null;
  }
};