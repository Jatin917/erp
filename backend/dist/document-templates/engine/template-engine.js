import { PdfTemplate } from "../implementations/pdf-template.js";
import { mappingService } from "../services/mapping.service.js";
import { systemFieldRegistryService } from "../services/system-field-registry.service.js";
import { templateService } from "../services/template.service.js";
export class TemplateEngine {
    async registerTemplate(input) {
        const template = PdfTemplate.draft(input);
        await template.registerTemplate();
        return template.toRecord();
    }
    async updateTemplate(id, input) {
        return templateService.updateTemplate(id, input);
    }
    async deleteTemplate(id) {
        return templateService.deleteTemplate(id);
    }
    async activateTemplate(id) {
        return templateService.activateTemplate(id);
    }
    async archiveTemplate(id) {
        return templateService.archiveTemplate(id);
    }
    async validateTemplate(id) {
        return templateService.validateTemplate(id);
    }
    async getTemplate(id) {
        return templateService.getTemplate(id);
    }
    async listTemplates(filters) {
        return templateService.listTemplates(filters);
    }
    async addMapping(templateId, input) {
        return mappingService.addMapping(templateId, input);
    }
    async updateMapping(templateId, mappingId, input) {
        return mappingService.updateMapping(templateId, mappingId, input);
    }
    async removeMapping(templateId, mappingId) {
        return mappingService.removeMapping(templateId, mappingId);
    }
    async getMappings(templateId) {
        return mappingService.getMappings(templateId);
    }
    async validateMappings(templateId) {
        return mappingService.validateMappings(templateId);
    }
    async getSystemField(fieldId) {
        return systemFieldRegistryService.getField(fieldId);
    }
    async getSystemFieldsByEntity(entityType) {
        return systemFieldRegistryService.getFieldsByEntity(entityType);
    }
    async searchSystemFields(filter) {
        return systemFieldRegistryService.searchFields(filter);
    }
}
export const templateEngine = new TemplateEngine();
//# sourceMappingURL=template-engine.js.map