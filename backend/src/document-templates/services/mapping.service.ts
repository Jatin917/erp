import { prisma } from "@src/server.js";
import { systemFieldRegistryService } from "./system-field-registry.service.js";
import { templateService } from "./template.service.js";
import { templateValidationService } from "./template-validation.service.js";
import type {
  TemplateFieldMappingInput,
  TemplateFieldMappingRecord,
  TemplateValidationResult,
  UpdateTemplateFieldMappingInput,
} from "../types/template.types.js";

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

export class MappingService {
  async getMappings(templateId: string): Promise<TemplateFieldMappingRecord[]> {
    await templateService.getTemplate(templateId);
    const rows = await prisma.reportTemplateFieldMapping.findMany({
      where: { templateId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toMapping);
  }

  async getMapping(templateId: string, mappingId: string): Promise<TemplateFieldMappingRecord> {
    const row = await prisma.reportTemplateFieldMapping.findFirst({
      where: { id: mappingId, templateId },
    });
    if (!row) throw new Error("Mapping not found");
    return toMapping(row);
  }

  async addMapping(
    templateId: string,
    input: TemplateFieldMappingInput
  ): Promise<TemplateFieldMappingRecord> {
    const template = await templateService.getTemplate(templateId);
    templateValidationService.assertMutableStatus(template.status);
    templateValidationService.validateMappingInput(input);
    await systemFieldRegistryService.validateFieldExists(input.systemFieldId);

    const row = await prisma.reportTemplateFieldMapping.create({
      data: {
        templateId,
        systemFieldId: input.systemFieldId,
        fieldKey: input.fieldKey,
        ...(input.fieldLabel != null && { fieldLabel: input.fieldLabel }),
        pageNumber: input.pageNumber ?? 1,
        xCoordinate: input.xCoordinate,
        yCoordinate: input.yCoordinate,
        alignment: input.alignment ?? "LEFT",
        isRequired: input.isRequired ?? false,
        ...(input.width != null && { width: input.width }),
        ...(input.height != null && { height: input.height }),
        ...(input.fontSize != null && { fontSize: input.fontSize }),
      },
    });

    await templateService.markConfiguredIfNeeded(templateId);
    return toMapping(row);
  }

  async updateMapping(
    templateId: string,
    mappingId: string,
    input: UpdateTemplateFieldMappingInput
  ): Promise<TemplateFieldMappingRecord> {
    const template = await templateService.getTemplate(templateId);
    templateValidationService.assertMutableStatus(template.status);
    templateValidationService.validateMappingUpdate(input);

    const existing = await prisma.reportTemplateFieldMapping.findFirst({
      where: { id: mappingId, templateId },
    });
    if (!existing) throw new Error("Mapping not found");

    if (input.systemFieldId) {
      await systemFieldRegistryService.validateFieldExists(input.systemFieldId);
    }

    const row = await prisma.reportTemplateFieldMapping.update({
      where: { id: mappingId },
      data: {
        ...(input.systemFieldId != null && { systemFieldId: input.systemFieldId }),
        ...(input.fieldKey != null && { fieldKey: input.fieldKey }),
        // allow explicitly clearing the label by passing empty string
        ...(input.fieldLabel !== undefined && { fieldLabel: input.fieldLabel || null }),
        ...(input.pageNumber != null && { pageNumber: input.pageNumber }),
        ...(input.xCoordinate != null && { xCoordinate: input.xCoordinate }),
        ...(input.yCoordinate != null && { yCoordinate: input.yCoordinate }),
        ...(input.width != null && { width: input.width }),
        ...(input.height != null && { height: input.height }),
        ...(input.fontSize != null && { fontSize: input.fontSize }),
        ...(input.alignment != null && { alignment: input.alignment }),
        ...(input.isRequired != null && { isRequired: input.isRequired }),
      },
    });

    return toMapping(row);
  }

  async removeMapping(templateId: string, mappingId: string): Promise<void> {
    const template = await templateService.getTemplate(templateId);
    templateValidationService.assertMutableStatus(template.status);

    const existing = await prisma.reportTemplateFieldMapping.findFirst({
      where: { id: mappingId, templateId },
      select: { id: true },
    });
    if (!existing) throw new Error("Mapping not found");

    await prisma.reportTemplateFieldMapping.delete({ where: { id: mappingId } });
  }

  async validateMappings(templateId: string): Promise<TemplateValidationResult> {
    const mappings = await this.getMappings(templateId);
    const errors: string[] = [];
    const seenSystemFields = new Set<string>();
    const seenFieldKeys = new Set<string>();

    for (const mapping of mappings) {
      if (seenSystemFields.has(mapping.systemFieldId)) {
        errors.push("Duplicate mapping for system field: " + mapping.systemFieldId);
      }
      seenSystemFields.add(mapping.systemFieldId);

      if (seenFieldKeys.has(mapping.fieldKey)) {
        errors.push("Duplicate fieldKey: " + mapping.fieldKey);
      }
      seenFieldKeys.add(mapping.fieldKey);

      try {
        templateValidationService.validateCoordinates(
          mapping.pageNumber,
          mapping.xCoordinate,
          mapping.yCoordinate,
          mapping.width,
          mapping.height
        );
        await systemFieldRegistryService.validateFieldExists(mapping.systemFieldId);
      } catch (error) {
        errors.push((error as Error).message);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export const mappingService = new MappingService();