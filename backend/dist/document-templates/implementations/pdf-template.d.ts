import { Template } from "../abstracts/template.abstract.js";
import type { RegisterTemplateInput, TemplateFieldMappingInput, TemplateFieldMappingRecord, TemplateRecord } from "../types/template.types.js";
export declare class PdfTemplate extends Template {
    static fromRecord(record: TemplateRecord): PdfTemplate;
    static draft(input: RegisterTemplateInput): PdfTemplate;
    registerTemplate(): Promise<void>;
    addFieldMapping(mapping: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    removeFieldMapping(mappingId: string): Promise<void>;
    validateTemplate(): Promise<boolean>;
    private hydrate;
}
//# sourceMappingURL=pdf-template.d.ts.map