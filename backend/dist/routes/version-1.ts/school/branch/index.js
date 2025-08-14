import { Router } from "express";
import { createSchool } from "../../../../controllers/school/school/index.js";
import { isPermitted } from "../../../../middlewares/permission/index.js";
const branchRouter = Router();
// @ts-ignore
branchRouter.post("/create-school", isPermitted, createSchool);
export { branchRouter };
//# sourceMappingURL=index.js.map