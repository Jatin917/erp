import type { SourceModule } from "../../../generated/prisma/index.js";
import { fieldRegistryService } from "@src/reports/services/field-registry.service.js";
import type {
  SystemFieldRecord,
  SystemFieldSearchFilter,
} from "../types/system-field.types.js";

const ENTITY_ALIASES: Record<string, SourceModule> = {
  student: "STUDENT",
  enrollment: "ENROLLMENT",
  attendance: "ATTENDANCE",
  fee: "FEE",
  fees: "FEE",
  parent: "PARENT",
  exam: "EXAM",
  transport: "TRANSPORT",
  academic: "ACADEMIC",
  employee: "SYSTEM",
  teacher: "SYSTEM",
  faculty: "SYSTEM",
  system: "SYSTEM",
  class: "CLASS",
};

const toEntityType = (sourceModule: SourceModule): string =>
  sourceModule.toLowerCase();

const toFieldType = (dataType: string): string => dataType.toLowerCase();

const toSystemFieldRecord = (field: {
  id: string;
  fieldKey: string;
  label: string;
  sourceModule: SourceModule;
  dataType: string;
  sourceColumn: string | null;
}): SystemFieldRecord => ({
  id: field.id,
  entityType: toEntityType(field.sourceModule),
  displayName: field.label,
  fieldPath: field.sourceColumn ?? field.fieldKey,
  fieldType: toFieldType(field.dataType),
});

export class SystemFieldRegistryService {
  resolveEntityType(entityType: string): SourceModule | undefined {
    const key = entityType.trim().toLowerCase();
    if (ENTITY_ALIASES[key]) return ENTITY_ALIASES[key];
    const upper = key.toUpperCase() as SourceModule;
    const modules: SourceModule[] = [
      "STUDENT", "ENROLLMENT", "ATTENDANCE", "FEE", "PARENT",
      "EXAM", "TRANSPORT", "ACADEMIC", "SYSTEM", "CLASS",
    ];
    return modules.includes(upper) ? upper : undefined;
  }

  async getField(fieldId: string): Promise<SystemFieldRecord | null> {
    await fieldRegistryService.ensureLoaded();
    const field = fieldRegistryService.getById(fieldId);
    return field ? toSystemFieldRecord(field) : null;
  }

  async getFieldsByEntity(entityType: string): Promise<SystemFieldRecord[]> {
    const sourceModule = this.resolveEntityType(entityType);
    if (!sourceModule) {
      throw new Error("Unknown entity type: " + entityType);
    }
    await fieldRegistryService.ensureLoaded();
    return fieldRegistryService
      .list({ sourceModule })
      .map(toSystemFieldRecord);
  }

  async searchFields(filter?: SystemFieldSearchFilter): Promise<SystemFieldRecord[]> {
    await fieldRegistryService.ensureLoaded();

    let listFilter: { sourceModule: string } | undefined;
    if (filter?.entityType) {
      const sourceModule = this.resolveEntityType(filter.entityType);
      if (!sourceModule) {
        throw new Error("Unknown entity type: " + filter.entityType);
      }
      listFilter = { sourceModule };
    }

    let rows = fieldRegistryService.list(listFilter);

    if (filter?.query?.trim()) {
      const q = filter.query.trim().toLowerCase();
      rows = rows.filter(
        (f) =>
          f.label.toLowerCase().includes(q) ||
          f.fieldKey.toLowerCase().includes(q)
      );
    }

    return rows.map(toSystemFieldRecord);
  }

  async validateFieldExists(systemFieldId: string): Promise<void> {
    await fieldRegistryService.ensureLoaded();
    const field = fieldRegistryService.getById(systemFieldId);
    if (!field) throw new Error("Unknown system field: " + systemFieldId);
    if (!field.isActive) throw new Error("Inactive system field: " + systemFieldId);
  }
}

export const systemFieldRegistryService = new SystemFieldRegistryService();