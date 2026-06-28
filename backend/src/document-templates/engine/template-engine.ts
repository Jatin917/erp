import { PdfTemplate } from "../implementations/pdf-template.js";
import { mappingService } from "../services/mapping.service.js";
import { systemFieldRegistryService } from "../services/system-field-registry.service.js";
import { templateService } from "../services/template.service.js";
import type { SystemFieldRecord, SystemFieldSearchFilter } from "../types/system-field.types.js";
import type {
  ListTemplatesFilter,
  RegisterTemplateInput,
  TemplateFieldMappingInput,
  TemplateFieldMappingRecord,
  TemplateRecord,
  TemplateValidationResult,
  UpdateTemplateFieldMappingInput,
  UpdateTemplateInput,
} from "../types/template.types.js";

export class TemplateEngine {
  async registerTemplate(input: RegisterTemplateInput): Promise<TemplateRecord> {
    const template = PdfTemplate.draft(input);
    await template.registerTemplate();
    return template.toRecord();
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateRecord> {
    return templateService.updateTemplate(id, input);
  }

  async deleteTemplate(id: string): Promise<void> {
    return templateService.deleteTemplate(id);
  }

  async activateTemplate(id: string): Promise<TemplateRecord> {
    return templateService.activateTemplate(id);
  }

  async archiveTemplate(id: string): Promise<TemplateRecord> {
    return templateService.archiveTemplate(id);
  }

  async validateTemplate(id: string): Promise<TemplateValidationResult> {
    return templateService.validateTemplate(id);
  }

  async getTemplate(id: string): Promise<TemplateRecord> {
    return templateService.getTemplate(id);
  }

  async listTemplates(filters?: ListTemplatesFilter): Promise<TemplateRecord[]> {
    return templateService.listTemplates(filters);
  }

  async addMapping(templateId: string, input: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord> {
    return mappingService.addMapping(templateId, input);
  }

  async updateMapping(
    templateId: string,
    mappingId: string,
    input: UpdateTemplateFieldMappingInput
  ): Promise<TemplateFieldMappingRecord> {
    return mappingService.updateMapping(templateId, mappingId, input);
  }

  async removeMapping(templateId: string, mappingId: string): Promise<void> {
    return mappingService.removeMapping(templateId, mappingId);
  }

  async getMappings(templateId: string): Promise<TemplateFieldMappingRecord[]> {
    return mappingService.getMappings(templateId);
  }

  async validateMappings(templateId: string): Promise<TemplateValidationResult> {
    return mappingService.validateMappings(templateId);
  }

  async getSystemField(fieldId: string): Promise<SystemFieldRecord | null> {
    return systemFieldRegistryService.getField(fieldId);
  }

  async getSystemFieldsByEntity(entityType: string): Promise<SystemFieldRecord[]> {
    return systemFieldRegistryService.getFieldsByEntity(entityType);
  }

  async searchSystemFields(filter?: SystemFieldSearchFilter): Promise<SystemFieldRecord[]> {
    return systemFieldRegistryService.searchFields(filter);
  }
}

export const templateEngine = new TemplateEngine();