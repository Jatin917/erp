import { Router } from "express";
import { createSchool, getBranches, getSchools, deleteSchool, editSchool, createCustomFields, getCustomFields } from "../../../../controllers/school/school/index.js";
import { isPermitted } from "../../../../middlewares/permission/index.js";
import multer from "multer";
import { createOrUpdateClass, createSection, getAllClass, getAllSections, deleteSection, updateSection, getClassNames, createClassName } from "../../../../controllers/school/class/index.js";
const branchRouter = Router();
// @ts-ignore
const upload = multer({ dest: "uploads/" });
branchRouter.post("/create-school", upload.single("file"), isPermitted, createSchool);
branchRouter.delete('/delete-school', isPermitted, deleteSchool);
branchRouter.put("/edit-school", isPermitted, editSchool);
branchRouter.get("/get-schools", getSchools);
branchRouter.get("/get-branches", getBranches);
branchRouter.post("/create-class", isPermitted, createOrUpdateClass);
branchRouter.post("/create-section", isPermitted, createSection);
branchRouter.patch("/update-section", isPermitted, updateSection);
branchRouter.delete("/delete-section", isPermitted, deleteSection);
branchRouter.get("/get-section", isPermitted, getAllSections);
branchRouter.get("/get-class", isPermitted, getAllClass);
branchRouter.get("/get-classNames", isPermitted, getClassNames);
branchRouter.post("/create-className", isPermitted, createClassName);
branchRouter.post("/create-customField", isPermitted, createCustomFields);
branchRouter.get("/get-customField", isPermitted, getCustomFields);
export { branchRouter };
//# sourceMappingURL=index.js.map