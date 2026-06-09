import type { RegisterTemplateInput, TemplateFieldMappingInput, TemplateFieldMappingRecord, TemplateRecord } from "../types/template.types.js";
export declare abstract class Template {
    id: string;
    name: string;
    description: string | null;
    pdfUrl: string;
    type: TemplateRecord["type"];
    status: TemplateRecord["status"];
    branchId: string | null;
    createdById: string | null;
    mappings: TemplateFieldMappingRecord[];
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<TemplateRecord> & Pick<TemplateRecord, "name" | "pdfUrl">);
    abstract registerTemplate(): Promise<void>;
    abstract addFieldMapping(mapping: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
    abstract removeFieldMapping(mappingId: string): Promise<void>;
    abstract validateTemplate(): Promise<boolean>;
    toRecord(): TemplateRecord;
}
export type { RegisterTemplateInput };
//# sourceMappingURL=template.abstract.d.ts.map