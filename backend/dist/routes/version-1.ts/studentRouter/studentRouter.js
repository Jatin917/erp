import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { bulkUploadStudents, createStudent, fetchStudents } from "../../../controllers/school/student/index.js";
import multer from "multer";
import { feeDoc, feeTransaction } from "../../../controllers/school/fees/fees.js";
export const studentRouter = Router();
const upload = multer({ dest: "uploads/" });
studentRouter.post("/create-student", isPermitted, createStudent);
studentRouter.post("/bulk-upload", upload.single("file"), isPermitted, bulkUploadStudents);
//@ts-ignore
studentRouter.get("/fetch", fetchStudents);
studentRouter.post("/fee-transaction", isPermitted, feeTransaction);
studentRouter.post("/fee-doc", isPermitted, feeDoc);
//# sourceMappingURL=studentRouter.js.map