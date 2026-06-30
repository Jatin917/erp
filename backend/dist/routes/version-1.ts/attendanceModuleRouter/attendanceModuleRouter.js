import { Router } from "express";
import { Permission } from "../../../../generated/prisma/index.js";
import { getSchoolDays } from "@src/controllers/school/attendance/index.js";
import { requirePermission } from "@src/middlewares/permission/index.js";
export const attendanceModuleRouter = Router();
attendanceModuleRouter.get("/get-school-days", requirePermission(Permission.VIEW_SESSION), getSchoolDays);
//# sourceMappingURL=attendanceModuleRouter.js.map