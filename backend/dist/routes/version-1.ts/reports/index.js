import { Router } from "express";
import { getReportFields } from "../../../controllers/reports/field-registry.js";
import { runReport } from "../../../controllers/reports/report.js";
export const reportsRouter = Router();
reportsRouter.get("/fields", getReportFields);
reportsRouter.post("/run", runReport);
//# sourceMappingURL=index.js.map