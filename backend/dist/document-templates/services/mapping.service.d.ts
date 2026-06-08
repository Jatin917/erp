import type { TemplateFieldMappingInput, TemplateFieldMappingRecord, TemplateValidationResult, UpdateTemplateFieldMappingInput } from "../types/template.types.js";
export declare class MappingService {
    getMappings(templateId: string): Promise<TemplateFieldMappingRecord[]>;
    addMapping(templateId: string, input: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    updateMapping(templateId: string, mappingId: string, input: UpdateTemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    removeMapping(templateId: string, mappingId: string): Promise<void>;
    validateMappings(templateId: string): Promise<TemplateValidationResult>;
}
export declare const mappingService: MappingService;
//# sourceMappingURL=mapping.service.d.ts.map