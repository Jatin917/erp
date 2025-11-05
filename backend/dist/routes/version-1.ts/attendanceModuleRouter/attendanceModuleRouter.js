import { getSchoolDays, upsertLectureFromDate } from "../../../controllers/school/attendance/index.js";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { Router } from "express";
export const attendanceModuleRouter = Router();
attendanceModuleRouter.get("/get-school-days", isPermitted, getSchoolDays);
//# sourceMappingURL=attendanceModuleRouter.js.map