import { Router } from "express";
import { Permission } from "../../../../generated/prisma/index.js";
import { getReportFields } from "@src/controllers/reports/field-registry.js";
import { runReport } from "@src/controllers/reports/report.js";
import { requirePermission } from "@src/middlewares/permission/index.js";

export const reportsRouter = Router();

reportsRouter.get("/fields", requirePermission(Permission.VIEW_REPORTS), getReportFields);
reportsRouter.post("/run", requirePermission(Permission.EXPORT_REPORTS), runReport);
