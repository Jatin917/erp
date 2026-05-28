import { type FieldRegistry } from "../../../generated/prisma/index.js";
import type { ProviderGroupedFields } from "../types/report.types.js";
export declare class FieldGroupingService {
    group(fields: FieldRegistry[]): ProviderGroupedFields;
    private resolveProviderKey;
}
export declare const fieldGroupingService: FieldGroupingService;
//# sourceMappingURL=field-grouping.service.d.ts.map