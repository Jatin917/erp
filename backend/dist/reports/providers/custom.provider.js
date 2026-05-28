import { FieldResolverType } from "../../../generated/prisma/index.js";
import { prisma } from "../../server.js";
export class CustomProvider {
    key = "custom";
    async fetch(context, fields) {
        if (fields.length === 0 || context.enrollmentIds.length === 0) {
            return {};
        }
        const enrollments = await prisma.enrollment.findMany({
            where: { id: { in: context.enrollmentIds } },
            select: { id: true, studentId: true },
        });
        const studentIdByEnrollment = new Map(enrollments.map((e) => [e.id, e.studentId]));
        const customFieldIds = fields
            .map((f) => {
            const cfg = f.resolverConfig;
            return cfg?.customFieldId;
        })
            .filter((id) => Boolean(id));
        if (customFieldIds.length === 0)
            return {};
        const values = await prisma.customFieldValue.findMany({
            where: {
                customFieldId: { in: customFieldIds },
                entityId: { in: [...studentIdByEnrollment.values()] },
            },
        });
        const valueLookup = new Map();
        for (const v of values) {
            valueLookup.set(`${v.customFieldId}:${v.entityId}`, v.value);
        }
        const rows = {};
        for (const enrollmentId of context.enrollmentIds) {
            rows[enrollmentId] = {};
            const studentId = studentIdByEnrollment.get(enrollmentId);
            if (!studentId)
                continue;
            for (const field of fields) {
                if (field.resolverType !== FieldResolverType.CUSTOM_FIELD) {
                    rows[enrollmentId][field.fieldKey] = null;
                    continue;
                }
                const cfg = field.resolverConfig;
                const customFieldId = cfg?.customFieldId;
                if (!customFieldId) {
                    rows[enrollmentId][field.fieldKey] = null;
                    continue;
                }
                rows[enrollmentId][field.fieldKey] =
                    valueLookup.get(`${customFieldId}:${studentId}`) ?? null;
            }
        }
        return rows;
    }
}
export const customProvider = new CustomProvider();
//# sourceMappingURL=custom.provider.js.map