import type {
  RegisterTemplateInput,
  TemplateFieldMappingInput,
  TemplateFieldMappingRecord,
  TemplateRecord,
} from "../types/template.types.js";

export abstract class Template {
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

  constructor(data: Partial<TemplateRecord> & Pick<TemplateRecord, "name" | "pdfUrl">) {
    this.id = data.id ?? "";
    this.name = data.name;
    this.description = data.description ?? null;
    this.pdfUrl = data.pdfUrl;
    this.type = data.type ?? "CUSTOM";
    this.status = data.status ?? "DRAFT";
    this.branchId = data.branchId ?? null;
    this.createdById = data.createdById ?? null;
    this.mappings = data.mappings ?? [];
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  abstract registerTemplate(): Promise<void>;
  abstract addFieldMapping(mapping: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord>;
  abstract removeFieldMapping(mappingId: string): Promise<void>;
  abstract validateTemplate(): Promise<boolean>;

  toRecord(): TemplateRecord {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      pdfUrl: this.pdfUrl,
      type: this.type,
      status: this.status,
      branchId: this.branchId,
      createdById: this.createdById,
      mappings: this.mappings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Re-export for backward compatibility with the RegisterTemplateInput type
export type { RegisterTemplateInput };