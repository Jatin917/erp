import type { FieldRegistry } from "../../../generated/prisma/index.js";
export declare class FieldRegistryService {
    ensureLoaded(): Promise<void>;
    getByKey(fieldKey: string): FieldRegistry | undefined;
    getById(id: string): FieldRegistry | undefined;
    getByKeys(fieldKeys: string[]): {
        resolved: FieldRegistry[];
        missing: string[];
        inactive: string[];
    };
    list(filters?: {
        sourceModule?: string;
        groupKey?: string;
    }): FieldRegistry[];
    validateReportFields(fieldKeys: string[]): FieldRegistry[];
}
export declare const fieldRegistryService: FieldRegistryService;
//# sourceMappingURL=field-registry.service.d.ts.map