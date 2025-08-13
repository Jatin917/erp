import { Router } from "express";
import { createSchool } from "../../../../controllers/school/school/index.js";
import { isPermitted } from "../../../../middlewares/permission/index.js";
export const branchRouter = Router();
branchRouter.post("/create-school", isPermitted, createSchool);
//# sourceMappingURL=index.js.map