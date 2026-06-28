import { Template } from "../abstracts/template.abstract.js";
import { mappingService } from "../services/mapping.service.js";
import { templateService } from "../services/template.service.js";
import type {
  RegisterTemplateInput,
  TemplateFieldMappingInput,
  TemplateFieldMappingRecord,
  TemplateRecord,
} from "../types/template.types.js";

export class PdfTemplate extends Template {
  static fromRecord(record: TemplateRecord): PdfTemplate {
    return new PdfTemplate(record);
  }

  static draft(input: RegisterTemplateInput): PdfTemplate {
    return new PdfTemplate({
      name: input.name,
      pdfUrl: input.pdfUrl,
      description: input.description ?? null,
      ...(input.type != null && { type: input.type }),
      branchId: input.branchId ?? null,
      createdById: input.createdById ?? null,
      status: "DRAFT",
      mappings: [],
    });
  }

  async registerTemplate(): Promise<void> {
    const created = await templateService.registerTemplate({
      name: this.name,
      pdfUrl: this.pdfUrl,
      ...(this.description != null && { description: this.description }),
      type: this.type,
      ...(this.branchId != null && { branchId: this.branchId }),
      ...(this.createdById != null && { createdById: this.createdById }),
    });
    this.hydrate(created);
  }

  async addFieldMapping(mapping: TemplateFieldMappingInput): Promise<TemplateFieldMappingRecord> {
    if (!this.id) throw new Error("Template must be registered first");
    const created = await mappingService.addMapping(this.id, mapping);
    this.mappings.push(created);
    this.status = this.mappings.length > 0 ? "CONFIGURED" : this.status;
    return created;
  }

  async removeFieldMapping(mappingId: string): Promise<void> {
    if (!this.id) throw new Error("Template must be registered first");
    await mappingService.removeMapping(this.id, mappingId);
    this.mappings = this.mappings.filter((m) => m.id !== mappingId);
  }

  async validateTemplate(): Promise<boolean> {
    if (!this.id) throw new Error("Template must be registered first");
    const result = await templateService.validateTemplate(this.id);
    if (!result.valid) throw new Error(result.errors.join("; "));
    return true;
  }

  private hydrate(record: TemplateRecord): void {
    Object.assign(this, record);
  }
}