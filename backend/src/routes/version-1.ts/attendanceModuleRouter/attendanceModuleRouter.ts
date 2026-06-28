import { getSchoolDays, upsertLectureFromDate } from "@src/controllers/school/attendance/index.js";
import { isPermitted } from "@src/middlewares/permission/index.js";
import { Router } from "express";

export const attendanceModuleRouter = Router();



attendanceModuleRouter.get("/get-school-days", isPermitted, getSchoolDays);