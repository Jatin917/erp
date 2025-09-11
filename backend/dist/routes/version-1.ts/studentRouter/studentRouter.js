import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { bulkUploadStudents, createStudent, downloadSampleSheetForBulkUpload, fetchStudents, getStudentDetail } from "../../../controllers/school/student/index.js";
import multer from "multer";
import { feeDoc, feeTransaction } from "../../../controllers/school/fees/fees.js";
export const studentRouter = Router();
const upload = multer({ dest: "uploads/" });
studentRouter.post("/create-student", isPermitted, createStudent);
studentRouter.post("/bulk-upload", upload.single("file"), isPermitted, bulkUploadStudents);
studentRouter.get("/download-bulk-sample", isPermitted, downloadSampleSheetForBulkUpload);
studentRouter.get("/:id", isPermitted, getStudentDetail);
studentRouter.post("/fee-transaction", isPermitted, feeTransaction);
studentRouter.post("/fee-doc", isPermitted, feeDoc);
//@ts-ignore
studentRouter.get("/", isPermitted, fetchStudents);
//# sourceMappingURL=studentRouter.js.map