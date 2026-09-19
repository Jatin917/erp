import { FieldCategory, FieldResolverType, RegistryDataType, SourceModule, customFieldType } from "../../../generated/prisma/index.js";
import { prismaClient } from "../../lib/prisma-client.js";
import { invalidateFieldRegistryCache } from "../cache/field-registry-cache.js";
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
export const customFieldRegistryKey = (entityType, name) => `custom_${entityType.toLowerCase()}_${name.toLowerCase()}`;
const registryPayload = (customField) => ({
    label: customField.label,
    sourceModule: mapEntityToSourceModule(customField.entityType),
    dataType: mapCustomFieldTypeToRegistryType(customField.type),
    resolverConfig: { customFieldId: customField.id, entityType: customField.entityType, branchId: customField.branchId },
    branchId: customField.branchId,
    isActive: true,
});
export const syncCustomFieldToRegistry = async (customField, previousFieldKey, options) => {
    const fieldKey = customFieldRegistryKey(customField.entityType, customField.name);
    const payload = registryPayload(customField);
    if (previousFieldKey && previousFieldKey !== fieldKey) {
        const existingByOldKey = await prismaClient.fieldRegistry.findUnique({ where: { fieldKey: previousFieldKey } });
        const existingByNewKey = await prismaClient.fieldRegistry.findUnique({ where: { fieldKey } });
        if (existingByNewKey && existingByNewKey.id !== existingByOldKey?.id) {
            throw new Error("A report field with this name already exists");
        }
        if (existingByOldKey) {
            await prismaClient.fieldRegistry.update({
                where: { id: existingByOldKey.id },
                data: { fieldKey, ...payload },
            });
            if (options?.invalidate !== false) {
                await invalidateFieldRegistryCache();
            }
            return;
        }
    }
    await prismaClient.fieldRegistry.upsert({
        where: { fieldKey },
        create: {
            fieldKey,
            sourceTable: "CustomFieldValue",
            fieldCategory: FieldCategory.CUSTOM,
            resolverType: FieldResolverType.CUSTOM_FIELD,
            isCustom: true,
            isSystemField: false,
            ...payload,
        },
        update: payload,
    });
    if (options?.invalidate !== false) {
        await invalidateFieldRegistryCache();
    }
};
export const syncCustomFieldsToRegistry = async () => {
    const customFields = await prismaClient.customField.findMany();
    for (const customField of customFields) {
        await syncCustomFieldToRegistry(customField, undefined, { invalidate: false });
    }
    await invalidateFieldRegistryCache();
};
//# sourceMappingURL=sync-custom-fields.js.map