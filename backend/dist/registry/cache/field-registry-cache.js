import { prismaClient } from "@src/lib/prisma-client.js";
import { RedisClient } from "@src/services/redis.js";
let fieldMap = new Map();
const CACHE_KEY = "field-registry:active:v1";
export const loadFieldRegistryCache = async () => {
    try {
        const redis = await RedisClient();
        const fromCache = await redis.get(CACHE_KEY);
        if (fromCache) {
            const rows = JSON.parse(fromCache);
            fieldMap = new Map(rows.map((row) => [row.fieldKey, row]));
            return fieldMap;
        }
    }
    catch (error) {
        console.error("Field registry redis load failed", error.message);
    }
    const rows = await prismaClient.fieldRegistry.findMany({ where: { isActive: true }, orderBy: [{ groupKey: "asc" }, { displayOrder: "asc" }] });
    fieldMap = new Map(rows.map((row) => [row.fieldKey, row]));
    try {
        const redis = await RedisClient();
        await redis.setEx(CACHE_KEY, 3600, JSON.stringify(rows));
    }
    catch (error) {
        console.error("Field registry redis save failed", error.message);
    }
    return fieldMap;
};
export const invalidateFieldRegistryCache = async () => {
    fieldMap = new Map();
    try {
        const redis = await RedisClient();
        await redis.del(CACHE_KEY);
    }
    catch (error) {
        console.error("Field registry cache invalidation failed", error.message);
    }
};
export const getFieldRegistryCache = () => fieldMap;
//# sourceMappingURL=field-registry-cache.js.map