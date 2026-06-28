import type { FieldRegistry } from "../../../generated/prisma/index.js";
import {
  getFieldRegistryCache,
  loadFieldRegistryCache,
} from "@src/registry/cache/field-registry-cache.js";

export class FieldRegistryService {
  async ensureLoaded(): Promise<void> {
    if (getFieldRegistryCache().size === 0) {
      await loadFieldRegistryCache();
    }
  }

  getByKey(fieldKey: string): FieldRegistry | undefined {
    return getFieldRegistryCache().get(fieldKey);
  }

  getById(id: string): FieldRegistry | undefined {
    for (const field of getFieldRegistryCache().values()) {
      if (field.id === id) return field;
    }
    return undefined;
  }

  getByKeys(fieldKeys: string[]): {
    resolved: FieldRegistry[];
    missing: string[];
    inactive: string[];
  } {
    const resolved: FieldRegistry[] = [];
    const missing: string[] = [];
    const inactive: string[] = [];

    for (const key of fieldKeys) {
      const field = getFieldRegistryCache().get(key);
      if (!field) {
        missing.push(key);
        continue;
      }
      if (!field.isActive) {
        inactive.push(key);
        continue;
      }
      resolved.push(field);
    }

    return { resolved, missing, inactive };
  }

  list(filters?: { sourceModule?: string; groupKey?: string }): FieldRegistry[] {
    let rows = [...getFieldRegistryCache().values()];
    if (filters?.sourceModule) {
      rows = rows.filter((row) => row.sourceModule === filters.sourceModule);
    }
    if (filters?.groupKey) {
      rows = rows.filter((row) => row.groupKey === filters.groupKey);
    }
    return rows.sort((a, b) => {
      const g = (a.groupKey ?? "").localeCompare(b.groupKey ?? "");
      if (g !== 0) return g;
      return a.displayOrder - b.displayOrder;
    });
  }

  validateReportFields(fieldKeys: string[]): FieldRegistry[] {
    const unique = [...new Set(fieldKeys)];
    if (unique.length === 0) {
      throw new Error("At least one field is required");
    }

    const { resolved, missing, inactive } = this.getByKeys(unique);

    if (missing.length > 0) {
      throw new Error(`Unknown field keys: ${missing.join(", ")}`);
    }
    if (inactive.length > 0) {
      throw new Error(`Inactive field keys: ${inactive.join(", ")}`);
    }

    return resolved;
  }
}

export const fieldRegistryService = new FieldRegistryService();
