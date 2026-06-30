import { FieldCategory, FieldResolverType, RegistryDataType, SourceModule, customFieldType } from "../../../generated/prisma/index.js";
import { prismaClient } from "@src/lib/prisma-client.js";
const mapEntityToSourceModule = (entityType) => entityType === "STUDENT" ? SourceModule.STUDENT : entityType === "PARENT" ? SourceModule.PARENT : SourceModule.SYSTEM;
const mapCustomFieldTypeToRegistryType = (type) => {
    if (type === "NUMBER" || type === "CURRENCY" || type === "PERCENTAGE")
        return RegistryDataType.NUMBER;
    if (type === "DATE")
        return RegistryDataType.DATE;
    if (type === "DATETIME")
        return RegistryDataType.DATETIME;
    if (type === "BOOLEAN" || type === "CHECKBOX")
        return RegistryDataType.BOOLEAN;
    if (type === "JSON")
        return RegistryDataType.JSON;
    return RegistryDataType.STRING;
};
export const syncCustomFieldsToRegistry = async () => {
    const customFields = await prismaClient.customField.findMany();
    for (const customField of customFields) {
        const fieldKey = `custom_${customField.entityType.toLowerCase()}_${customField.name.toLowerCase()}`;
        await prismaClient.fieldRegistry.upsert({
            where: { fieldKey },
            create: {
                fieldKey, label: customField.label, sourceModule: mapEntityToSourceModule(customField.entityType),
                sourceTable: "CustomFieldValue", fieldCategory: FieldCategory.CUSTOM,
                dataType: mapCustomFieldTypeToRegistryType(customField.type), resolverType: FieldResolverType.CUSTOM_FIELD,
                resolverConfig: { customFieldId: customField.id, entityType: customField.entityType, branchId: customField.branchId },
                branchId: customField.branchId, isCustom: true, isSystemField: false, isActive: true,
            },
            update: {
                label: customField.label,
                dataType: mapCustomFieldTypeToRegistryType(customField.type),
                resolverConfig: { customFieldId: customField.id, entityType: customField.entityType, branchId: customField.branchId },
                branchId: customField.branchId, isActive: true,
            },
        });
    }
};
//# sourceMappingURL=sync-custom-fields.js.map