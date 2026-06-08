import type { ListTemplatesFilter, RegisterTemplateInput, TemplateRecord, TemplateValidationResult, UpdateTemplateInput } from "../types/template.types.js";
export declare class TemplateService {
    registerTemplate(input: RegisterTemplateInput): Promise<TemplateRecord>;
    updateTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateRecord>;
    deleteTemplate(id: string): Promise<void>;
    getTemplate(id: string): Promise<TemplateRecord>;
    listTemplates(filters?: ListTemplatesFilter): Promise<TemplateRecord[]>;
    activateTemplate(id: string): Promise<TemplateRecord>;
    archiveTemplate(id: string): Promise<TemplateRecord>;
    markConfiguredIfNeeded(id: string): Promise<void>;
    validateTemplate(id: string): Promise<TemplateValidationResult>;
}
export declare const templateService: TemplateService;
//# sourceMappingURL=template.service.d.ts.map