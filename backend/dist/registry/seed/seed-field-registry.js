import { prismaClient } from "../../lib/prisma-client.js";
import { allFieldDefinitions } from "../definitions/index.js";
export const seedFieldRegistry = async () => {
    for (const field of allFieldDefinitions) {
        await prismaClient.fieldRegistry.upsert({
            where: { fieldKey: field.fieldKey },
            create: {
                fieldKey: field.fieldKey, label: field.label, description: field.description ?? null,
                sourceModule: field.sourceModule, sourceTable: field.sourceTable, sourceColumn: field.sourceColumn ?? null,
                fieldCategory: field.fieldCategory, dataType: field.dataType, enumName: field.enumName ?? null,
                resolverType: field.resolverType, resolverConfig: field.resolverConfig ? field.resolverConfig : undefined,
                isFilterable: field.isFilterable ?? true, isSortable: field.isSortable ?? true,
                isExportable: field.isExportable ?? true, isVisibleInPicker: field.isVisibleInPicker ?? true,
                isSystemField: field.isSystemField ?? true, isCustom: false, isActive: true,
                groupKey: field.groupKey ?? null, displayOrder: field.displayOrder ?? 0,
                requiredPermission: field.requiredPermission ?? null, schemaVersion: field.schemaVersion ?? 1,
                seededFrom: "src/registry/definitions/index.ts",
            },
            update: {
                label: field.label, description: field.description ?? null, sourceModule: field.sourceModule,
                sourceTable: field.sourceTable, sourceColumn: field.sourceColumn ?? null,
                fieldCategory: field.fieldCategory, dataType: field.dataType, enumName: field.enumName ?? null,
                resolverType: field.resolverType, resolverConfig: field.resolverConfig ? field.resolverConfig : undefined,
                isFilterable: field.isFilterable ?? true, isSortable: field.isSortable ?? true,
                isExportable: field.isExportable ?? true, isVisibleInPicker: field.isVisibleInPicker ?? true,
                isSystemField: field.isSystemField ?? true, isActive: true,
                groupKey: field.groupKey ?? null, displayOrder: field.displayOrder ?? 0,
                requiredPermission: field.requiredPermission ?? null, schemaVersion: field.schemaVersion ?? 1,
                seededFrom: "src/registry/definitions/index.ts",
            },
        });
    }
};
//# sourceMappingURL=seed-field-registry.js.map