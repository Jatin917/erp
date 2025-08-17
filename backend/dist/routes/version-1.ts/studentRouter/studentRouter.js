import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { bulkUploadStudents, createStudent } from "../../../controllers/school/student/index.js";
import multer from "multer";
export const studentRouter = Router();
const upload = multer({ dest: "uploads/" });
studentRouter.post("/create-student", isPermitted, createStudent);
studentRouter.post("/create-bulk-students", upload.single("file"), isPermitted, bulkUploadStudents);
//# sourceMappingURL=studentRouter.js.map