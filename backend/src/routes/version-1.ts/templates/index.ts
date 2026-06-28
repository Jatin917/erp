import { Router } from "express";
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

export const templatesRouter = Router();

templatesRouter.get("/system-fields", listSystemFields);
templatesRouter.get("/system-fields/:entityType", listSystemFieldsByEntity);
templatesRouter.post("/", createTemplate);
templatesRouter.get("/", listTemplates);
templatesRouter.get("/:id", getTemplate);
templatesRouter.put("/:id", updateTemplate);
templatesRouter.delete("/:id", deleteTemplate);
templatesRouter.post("/:id/activate", activateTemplate);
templatesRouter.post("/:id/archive", archiveTemplate);
templatesRouter.post("/:id/validate", validateTemplate);
templatesRouter.get("/:id/mappings", listMappings);
templatesRouter.post("/:id/mappings", addMapping);
templatesRouter.put("/:id/mappings/:mappingId", updateMapping);
templatesRouter.delete("/:id/mappings/:mappingId", removeMapping);