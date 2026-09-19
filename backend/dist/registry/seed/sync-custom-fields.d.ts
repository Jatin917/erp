import { type CustomField, type ENTITES } from "../../../generated/prisma/index.js";
export declare const customFieldRegistryKey: (entityType: ENTITES, name: string) => string;
export declare const syncCustomFieldToRegistry: (customField: CustomField, previousFieldKey?: string, options?: {
    invalidate?: boolean;
}) => Promise<void>;
export declare const syncCustomFieldsToRegistry: () => Promise<void>;
//# sourceMappingURL=sync-custom-fields.d.ts.map