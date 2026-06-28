import { Router } from "express";
import { getReportFields } from "@src/controllers/reports/field-registry.js";
import { runReport } from "@src/controllers/reports/report.js";

export const reportsRouter = Router();

reportsRouter.get("/fields", getReportFields);
reportsRouter.post("/run", runReport);
