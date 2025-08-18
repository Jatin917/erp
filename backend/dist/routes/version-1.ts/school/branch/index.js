import { Router } from "express";
import { createSchool } from "../../../../controllers/school/school/index.js";
import { isPermitted } from "../../../../middlewares/permission/index.js";
import multer from "multer";
import { feeDoc, feeTransaction } from "../../../../controllers/school/fees/fees.js";
const branchRouter = Router();
// @ts-ignore
const upload = multer({ dest: "uploads/" });
branchRouter.post("/create-school", upload.single("logo"), isPermitted, createSchool);
export { branchRouter };
//# sourceMappingURL=index.js.map