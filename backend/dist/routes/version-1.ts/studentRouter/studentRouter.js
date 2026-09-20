import { Router } from "express";
import multer from "multer";
import { Permission } from "../../../../generated/prisma/index.js";
import { bulkUploadStudents, createStudent, downloadSampleSheetForBulkUpload, exportBulkUploadJobRows, fetchStudents, getBulkUploadJob, getStudentDetail, listBulkUploadJobRows, listBulkUploadJobs, updateStudent, } from "../../../controllers/school/student/index.js";
import { requirePermission } from "../../../middlewares/permission/index.js";
export const studentRouter = Router();
const upload = multer({ dest: "uploads/" });
studentRouter.post("/create-student", upload.single("file"), requirePermission(Permission.CREATE_STUDENT), createStudent);
studentRouter.patch("/:id", upload.single("file"), requirePermission(Permission.EDIT_STUDENT), updateStudent);
studentRouter.post("/bulk-upload", upload.single("file"), requirePermission(Permission.BULK_UPLOAD_STUDENTS), bulkUploadStudents);
studentRouter.get("/download-bulk-sample", requirePermission(Permission.GET_BULK_UPLOAD_SHEET), downloadSampleSheetForBulkUpload);
studentRouter.get("/bulk-upload-jobs", requirePermission(Permission.BULK_UPLOAD_STUDENTS), listBulkUploadJobs);
studentRouter.get("/bulk-upload-jobs/:jobId/export", requirePermission(Permission.BULK_UPLOAD_STUDENTS), exportBulkUploadJobRows);
studentRouter.get("/bulk-upload-jobs/:jobId", requirePermission(Permission.BULK_UPLOAD_STUDENTS), getBulkUploadJob);
studentRouter.get("/bulk-upload-jobs/:jobId/rows", requirePermission(Permission.BULK_UPLOAD_STUDENTS), listBulkUploadJobRows);
studentRouter.get("/:id", requirePermission(Permission.VIEW_STUDENT), getStudentDetail);
//@ts-ignore
studentRouter.get("/", requirePermission(Permission.VIEW_STUDENT), fetchStudents);
//# sourceMappingURL=studentRouter.js.map