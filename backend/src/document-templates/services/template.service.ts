import { prisma } from "@src/server.js";
import type { TemplateStatus } from "../../../generated/prisma/index.js";
import { templateValidationService } from "./template-validation.service.js";
import type {
  ListTemplatesFilter,
  RegisterTemplateInput,
  TemplateFieldMappingRecord,
  TemplateRecord,
  TemplateValidationResult,
  UpdateTemplateInput,
} from "../types/template.types.js";

const mappingInclude = {
  mappings: { orderBy: { createdAt: "asc" as const } },
} as const;

const toMapping = (row: {
  id: string;
  templateId: string;
  systemFieldId: string;
  fieldKey: string;
  fieldLabel: string | null;
  pageNumber: number;
  xCoordinate: number;
  yCoordinate: number;
  width: number | null;
  height: number | null;
  fontSize: number | null;
  alignment: TemplateFieldMappingRecord["alignment"];
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}): TemplateFieldMappingRecord => ({
  id: row.id,
  templateId: row.templateId,
  systemFieldId: row.systemFieldId,
  fieldKey: row.fieldKey,
  fieldLabel: row.fieldLabel,
  pageNumber: row.pageNumber,
  xCoordinate: row.xCoordinate,
  yCoordinate: row.yCoordinate,
  width: row.width,
  height: row.height,
  fontSize: row.fontSize,
  alignment: row.alignment,
  isRequired: row.isRequired,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toRecord = (row: {
  id: string;
  name: string;
  description: string | null;
  pdfUrl: string;
  type: TemplateRecord["type"];
  status: TemplateStatus;
  branchId: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  mappings: Parameters<typeof toMapping>[0][];
}): TemplateRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  pdfUrl: row.pdfUrl,
  type: row.type,
  status: row.status,
  branchId: row.branchId,
  createdById: row.createdById,
  mappings: row.mappings.map(toMapping),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class TemplateService {
  async registerTemplate(input: RegisterTemplateInput): Promise<TemplateRecord> {
    templateValidationService.validateRegistration(input);
    const row = await prisma.documentTemplate.create({
      data: {
        name: input.name,
        pdfUrl: input.pdfUrl,
        status: "DRAFT",
        type: input.type ?? "CUSTOM",
        ...(input.description != null && { description: input.description }),
        ...(input.branchId != null && { branchId: input.branchId }),
        ...(input.createdById != null && { createdById: input.createdById }),
      },
      include: mappingInclude,
    });
    return toRecord(row);
  }

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<TemplateRecord> {
    const existing = await this.getTemplate(id);
    templateValidationService.assertMutableStatus(existing.status);

    const row = await prisma.documentTemplate.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name }),
        ...(input.description != null && { description: input.description }),
        ...(input.pdfUrl != null && { pdfUrl: input.pdfUrl }),
        ...(input.type != null && { type: input.type }),
        ...(input.branchId != null && { branchId: input.branchId }),
      },
      include: mappingInclude,
    });
    return toRecord(row);
  }

  async deleteTemplate(id: string): Promise<void> {
    const existing = await this.getTemplate(id);
    if (existing.status === "ACTIVE") {
      throw new Error("Active templates cannot be deleted. Archive first.");
    }
    await prisma.documentTemplate.delete({ where: { id } });
  }

  async getTemplate(id: string): Promise<TemplateRecord> {
    const row = await prisma.documentTemplate.findUnique({
      where: { id },
      include: mappingInclude,
    });
    if (!row) throw new Error("Template not found");
    return toRecord(row);
  }

  async listTemplates(filters?: ListTemplatesFilter): Promise<TemplateRecord[]> {
    const rows = await prisma.documentTemplate.findMany({
      where: {
        ...(filters?.branchId != null && { branchId: filters.branchId }),
        ...(filters?.type != null && { type: filters.type }),
        ...(filters?.status != null && { status: filters.status }),
        ...(filters?.createdById != null && { createdById: filters.createdById }),
      },
      include: mappingInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toRecord);
  }

  async activateTemplate(id: string): Promise<TemplateRecord> {
    const template = await this.getTemplate(id);
    const validation = await templateValidationService.validateTemplateRecord(template, {
      requireMappings: true,
    });
    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }
    const row = await prisma.documentTemplate.update({
      where: { id },
      data: { status: "ACTIVE" },
      include: mappingInclude,
    });
    return toRecord(row);
  }

  async archiveTemplate(id: string): Promise<TemplateRecord> {
    await this.getTemplate(id);
    const row = await prisma.documentTemplate.update({
      where: { id },
      data: { status: "ARCHIVED" },
      include: mappingInclude,
    });
    return toRecord(row);
  }

  async markConfiguredIfNeeded(id: string): Promise<void> {
    const template = await this.getTemplate(id);
    if (template.status === "DRAFT" && template.mappings.length > 0) {
      await prisma.documentTemplate.update({
        where: { id },
        data: { status: "CONFIGURED" },
      });
    }
  }

  async validateTemplate(id: string): Promise<TemplateValidationResult> {
    const template = await this.getTemplate(id);
    return templateValidationService.validateTemplateRecord(template, {
      requireMappings: template.status === "ACTIVE",
    });
  }
}

export const templateService = new TemplateService();