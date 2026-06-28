import type { SourceModule } from "../../../generated/prisma/index.js";
import type { SystemFieldRecord, SystemFieldSearchFilter } from "../types/system-field.types.js";
export declare class SystemFieldRegistryService {
    resolveEntityType(entityType: string): SourceModule | undefined;
    getField(fieldId: string): Promise<SystemFieldRecord | null>;
    getFieldsByEntity(entityType: string): Promise<SystemFieldRecord[]>;
    searchFields(filter?: SystemFieldSearchFilter): Promise<SystemFieldRecord[]>;
    validateFieldExists(systemFieldId: string): Promise<void>;
}
export declare const systemFieldRegistryService: SystemFieldRegistryService;
//# sourceMappingURL=system-field-registry.service.d.ts.map