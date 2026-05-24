import { Router } from "express";
import { getReportFields } from "../../../controllers/reports/field-registry.js";
export const reportsRouter = Router();
reportsRouter.get("/fields", getReportFields);
//# sourceMappingURL=index.js.map