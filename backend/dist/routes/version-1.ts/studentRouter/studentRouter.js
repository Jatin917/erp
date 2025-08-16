import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import { bulkUploadStudents, createStudent } from "../../../controllers/school/student/index.js";
export const studentRouter = Router();
studentRouter.post("/create-student", isPermitted, createStudent);
studentRouter.post("/create-bulk-students", isPermitted, bulkUploadStudents);
//# sourceMappingURL=studentRouter.js.map