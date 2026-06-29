import { Router } from "express";
import multer from "multer";
import { Permission } from "../../../../../generated/prisma/index.js";
import { getTimeTable, upsertLectureFromDate } from "@src/controllers/school/attendance/index.js";
import {
	createClassName,
	createFaculty,
	createOrUpdateClass,
	createSection,
	createSubject,
	deleteSection,
	deleteSubject,
	getAllClass,
	getAllSections,
	getClassNames,
	getFaculty,
	getSubjects,
	updateFaculty,
	updateSection,
	updateSubject,
} from "@src/controllers/school/class/index.js";
import {
	createCustomFields,
	createSchool,
	deleteSchool,
	editSchool,
	getBranches,
	getCustomFields,
	getSchools,
} from "@src/controllers/school/school/index.js";
import { requirePermission } from "@src/middlewares/permission/index.js";

const branchRouter = Router();

// @ts-ignore
const upload = multer({ dest: "uploads/" });

branchRouter.post(
	"/create-school",
	upload.single("file"),
	requirePermission(Permission.CREATE_SCHOOL),
	createSchool,
);
branchRouter.delete("/delete-school", requirePermission(Permission.DELETE_SCHOOL), deleteSchool);
branchRouter.put("/edit-school", requirePermission(Permission.EDIT_SCHOOL), editSchool);
branchRouter.get("/get-schools", requirePermission(Permission.VIEW_SCHOOL), getSchools);
branchRouter.get("/get-branches", requirePermission(Permission.VIEW_BRANCH), getBranches);
branchRouter.post("/create-class", requirePermission(Permission.CREATE_CLASS), createOrUpdateClass);
branchRouter.post("/create-section", requirePermission(Permission.CREATE_CLASS), createSection);
branchRouter.patch("/update-section", requirePermission(Permission.EDIT_CLASS), updateSection);
branchRouter.delete("/delete-section", requirePermission(Permission.DELETE_CLASS), deleteSection);
branchRouter.get("/get-section", requirePermission(Permission.VIEW_CLASS), getAllSections);
branchRouter.get("/get-class", requirePermission(Permission.VIEW_CLASS), getAllClass);
branchRouter.get("/get-classNames", requirePermission(Permission.VIEW_CLASSNAME), getClassNames);
branchRouter.post("/create-className", requirePermission(Permission.CREATE_CLASSNAME), createClassName);
branchRouter.post("/create-customField", requirePermission(Permission.CREATE_CUSTOM_FIELD), createCustomFields);
branchRouter.get("/get-customField", requirePermission(Permission.GET_CUSTOM_FIELD), getCustomFields);
branchRouter.post("/create-subject", requirePermission(Permission.CREATE_CLASS), createSubject);
branchRouter.get("/get-subjects", requirePermission(Permission.VIEW_CLASS), getSubjects);
branchRouter.delete("/delete-subject", requirePermission(Permission.DELETE_CLASS), deleteSubject);
branchRouter.patch("/update-subject", requirePermission(Permission.EDIT_CLASS), updateSubject);

branchRouter.post("/create-faculty", requirePermission(Permission.EDIT_BRANCH), createFaculty);
branchRouter.get("/get-faculty", requirePermission(Permission.VIEW_BRANCH), getFaculty);
branchRouter.patch("/update-faculty", requirePermission(Permission.EDIT_BRANCH), updateFaculty);

branchRouter.post("/generate-lecture", requirePermission(Permission.EDIT_CLASS), upsertLectureFromDate);
branchRouter.get("/get-timetable", requirePermission(Permission.VIEW_CLASS), getTimeTable);

export { branchRouter };
