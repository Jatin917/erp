import { Router } from "express";
import { createSchool, getSchools } from "../../../../controllers/school/school/index.js";
import { isPermitted } from "../../../../middlewares/permission/index.js";
import multer from "multer";
import { feeDoc, feeReciept, feeTransaction } from "../../../../controllers/school/fees/fees.js";
const branchRouter = Router();
// @ts-ignore
const upload = multer({ dest: "uploads/" });
branchRouter.post("/create-school", upload.single("logo"), isPermitted, createSchool);
branchRouter.get("/fee-reciept", isPermitted, feeReciept);
branchRouter.get("/get-schools", getSchools);
export { branchRouter };
//# sourceMappingURL=index.js.map