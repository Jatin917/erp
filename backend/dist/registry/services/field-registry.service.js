import { prismaClient } from "@src/lib/prisma-client.js";
import { getFieldRegistryCache, loadFieldRegistryCache } from "../cache/field-registry-cache.js";
export const getActiveRegistryFields = async (filters) => {
    const cache = getFieldRegistryCache();
    if (cache.size === 0)
        await loadFieldRegistryCache();
    let rows = [...getFieldRegistryCache().values()];
    if (filters?.sourceModule)
        rows = rows.filter((row) => row.sourceModule === filters.sourceModule);
    if (filters?.groupKey)
        rows = rows.filter((row) => row.groupKey === filters.groupKey);
    return rows;
};
export const getActiveRegistryFieldsFromDb = async () => {
    return prismaClient.fieldRegistry.findMany({ where: { isActive: true }, orderBy: [{ groupKey: "asc" }, { displayOrder: "asc" }] });
};
//# sourceMappingURL=field-registry.service.js.map