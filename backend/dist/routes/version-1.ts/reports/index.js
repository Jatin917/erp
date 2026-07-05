import { Router } from "express";
import { Permission } from "../../../../generated/prisma/index.js";
import { getReportFields } from "../../../controllers/reports/field-registry.js";
import { runReport } from "../../../controllers/reports/report.js";
import { requirePermission } from "../../../middlewares/permission/index.js";
export const reportsRouter = Router();
reportsRouter.get("/fields", requirePermission(Permission.VIEW_REPORTS), getReportFields);
reportsRouter.post("/run", requirePermission(Permission.EXPORT_REPORTS), runReport);
//# sourceMappingURL=index.js.map