import { FieldCategory } from "../../../generated/prisma/index.js";
import { PROVIDER_MODULE_MAP } from "../types/report.types.js";
export class FieldGroupingService {
    group(fields) {
        const grouped = {};
        for (const field of fields) {
            const providerKey = this.resolveProviderKey(field);
            if (!grouped[providerKey])
                grouped[providerKey] = [];
            grouped[providerKey].push(field.fieldKey);
        }
        return grouped;
    }
    resolveProviderKey(field) {
        if (field.isCustom || field.fieldCategory === FieldCategory.CUSTOM) {
            return "custom";
        }
        if (field.fieldCategory === FieldCategory.COMPUTED ||
            field.fieldCategory === FieldCategory.SUMMARY) {
            if (field.sourceModule === "FEE")
                return "fees";
            if (field.sourceModule === "ATTENDANCE")
                return "attendance";
        }
        return PROVIDER_MODULE_MAP[field.sourceModule] ?? "student";
    }
}
export const fieldGroupingService = new FieldGroupingService();
//# sourceMappingURL=field-grouping.service.js.map