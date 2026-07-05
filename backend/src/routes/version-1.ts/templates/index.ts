import { Router } from "express";
import { Permission } from "../../../../generated/prisma/index.js";
import {
	addMapping,
	listMappings,
	removeMapping,
	updateMapping,
} from "@src/controllers/templates/mapping.js";
import {
	listSystemFields,
	listSystemFieldsByEntity,
} from "@src/controllers/templates/system-fields.js";
import {
	activateTemplate,
	archiveTemplate,
	createTemplate,
	deleteTemplate,
	getTemplate,
	listTemplates,
	updateTemplate,
	validateTemplate,
} from "@src/controllers/templates/template.js";
import { requirePermission } from "@src/middlewares/permission/index.js";

export const templatesRouter: Router = Router();

templatesRouter.get(
	"/system-fields",
	requirePermission(Permission.VIEW_REPORTS),
	listSystemFields,
);
templatesRouter.get(
	"/system-fields/:entityType",
	requirePermission(Permission.VIEW_REPORTS),
	listSystemFieldsByEntity,
);
templatesRouter.post("/", requirePermission(Permission.EDIT_SCHOOL), createTemplate);
templatesRouter.get("/", requirePermission(Permission.VIEW_REPORTS), listTemplates);
templatesRouter.get("/:id", requirePermission(Permission.VIEW_REPORTS), getTemplate);
templatesRouter.put("/:id", requirePermission(Permission.EDIT_SCHOOL), updateTemplate);
templatesRouter.delete("/:id", requirePermission(Permission.EDIT_SCHOOL), deleteTemplate);
templatesRouter.post("/:id/activate", requirePermission(Permission.EDIT_SCHOOL), activateTemplate);
templatesRouter.post("/:id/archive", requirePermission(Permission.EDIT_SCHOOL), archiveTemplate);
templatesRouter.post("/:id/validate", requirePermission(Permission.VIEW_REPORTS), validateTemplate);
templatesRouter.get("/:id/mappings", requirePermission(Permission.VIEW_REPORTS), listMappings);
templatesRouter.post("/:id/mappings", requirePermission(Permission.EDIT_SCHOOL), addMapping);
templatesRouter.put("/:id/mappings/:mappingId", requirePermission(Permission.EDIT_SCHOOL), updateMapping);
templatesRouter.delete(
	"/:id/mappings/:mappingId",
	requirePermission(Permission.EDIT_SCHOOL),
	removeMapping,
);
