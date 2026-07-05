import { fieldRegistryService } from "../../reports/services/field-registry.service.js";
const ENTITY_ALIASES = {
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
const toEntityType = (sourceModule) => sourceModule.toLowerCase();
const toFieldType = (dataType) => dataType.toLowerCase();
const toSystemFieldRecord = (field) => ({
    id: field.id,
    entityType: toEntityType(field.sourceModule),
    displayName: field.label,
    fieldPath: field.sourceColumn ?? field.fieldKey,
    fieldType: toFieldType(field.dataType),
});
export class SystemFieldRegistryService {
    resolveEntityType(entityType) {
        const key = entityType.trim().toLowerCase();
        if (ENTITY_ALIASES[key])
            return ENTITY_ALIASES[key];
        const upper = key.toUpperCase();
        const modules = [
            "STUDENT", "ENROLLMENT", "ATTENDANCE", "FEE", "PARENT",
            "EXAM", "TRANSPORT", "ACADEMIC", "SYSTEM", "CLASS",
        ];
        return modules.includes(upper) ? upper : undefined;
    }
    async getField(fieldId) {
        await fieldRegistryService.ensureLoaded();
        const field = fieldRegistryService.getById(fieldId);
        return field ? toSystemFieldRecord(field) : null;
    }
    async getFieldsByEntity(entityType) {
        const sourceModule = this.resolveEntityType(entityType);
        if (!sourceModule) {
            throw new Error("Unknown entity type: " + entityType);
        }
        await fieldRegistryService.ensureLoaded();
        return fieldRegistryService
            .list({ sourceModule })
            .map(toSystemFieldRecord);
    }
    async searchFields(filter) {
        await fieldRegistryService.ensureLoaded();
        let listFilter;
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
            rows = rows.filter((f) => f.label.toLowerCase().includes(q) ||
                f.fieldKey.toLowerCase().includes(q));
        }
        return rows.map(toSystemFieldRecord);
    }
    async validateFieldExists(systemFieldId) {
        await fieldRegistryService.ensureLoaded();
        const field = fieldRegistryService.getById(systemFieldId);
        if (!field)
            throw new Error("Unknown system field: " + systemFieldId);
        if (!field.isActive)
            throw new Error("Inactive system field: " + systemFieldId);
    }
}
export const systemFieldRegistryService = new SystemFieldRegistryService();
//# sourceMappingURL=system-field-registry.service.js.map