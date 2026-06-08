import type { SystemFieldRecord, SystemFieldSearchFilter } from "../types/system-field.types.js";
import type { ListTemplatesFilter, RegisterTemplateInput, TemplateFieldMappingInput, TemplateFieldMappingRecord, TemplateRecord, TemplateValidationResult, UpdateTemplateFieldMappingInput, UpdateTemplateInput } from "../types/template.types.js";
export declare class TemplateEngine {
    registerTemplate(input: RegisterTemplateInput): Promise<TemplateRecord>;
    updateTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateRecord>;
    deleteTemplate(id: string): Promise<void>;
    activateTemplate(id: string): Promise<TemplateRecord>;
    archiveTemplate(id: string): Promise<TemplateRecord>;
    validateTemplate(id: string): Promise<TemplateValidationResult>;
    getTemplate(id: string): Promise<TemplateRecord>;
    listTemplates(filters?: ListTemplatesFilter): Promise<TemplateRecord[]>;
    addMapping(templateId: string, input: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    updateMapping(templateId: string, mappingId: string, input: UpdateTemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    removeMapping(templateId: string, mappingId: string): Promise<void>;
    getMappings(templateId: string): Promise<TemplateFieldMappingRecord[]>;
    validateMappings(templateId: string): Promise<TemplateValidationResult>;
    getSystemField(fieldId: string): Promise<SystemFieldRecord | null>;
    getSystemFieldsByEntity(entityType: string): Promise<SystemFieldRecord[]>;
    searchSystemFields(filter?: SystemFieldSearchFilter): Promise<SystemFieldRecord[]>;
}
export declare const templateEngine: TemplateEngine;
//# sourceMappingURL=template-engine.d.ts.map