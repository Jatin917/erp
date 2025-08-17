import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { bulkUploadStudents, createStudent, fetchStudents } from "../../../controllers/school/student/index.js";
import multer from "multer";
export const studentRouter = Router();
const upload = multer({ dest: "uploads/" });
studentRouter.post("/create-student", isPermitted, createStudent);
studentRouter.post("/bulk-upload", upload.single("file"), isPermitted, bulkUploadStudents);
//@ts-ignore
studentRouter.get("/fetch", fetchStudents);
//# sourceMappingURL=studentRouter.js.map