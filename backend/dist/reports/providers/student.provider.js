import { FieldCategory, FieldResolverType, } from "../../../generated/prisma/index.js";
import { prisma } from "../../server.js";
import { buildEnrollmentWhere } from "../utils/enrollment-filters.js";
import { getValueByPath, serializeFieldValue } from "../utils/path-resolver.js";
const ENROLLMENT_INCLUDE = {
    student: true,
    session: true,
    class: { include: { classLabel: true, section: true } },
};
export class StudentProvider {
    key = "student";
    async resolveScope(context, fields) {
        const enrollments = await prisma.enrollment.findMany({
            where: buildEnrollmentWhere(context.branchId, context.sessionId, context.filters),
            include: ENROLLMENT_INCLUDE,
        });
        const enrollmentIds = enrollments.map((e) => e.id);
        const rows = {};
        for (const enrollment of enrollments) {
            rows[enrollment.id] = {};
            for (const field of fields) {
                rows[enrollment.id][field.fieldKey] = this.resolveFieldValue(field, enrollment);
            }
        }
        return { enrollmentIds, rows };
    }
    async fetch(context, fields) {
        if (fields.length === 0)
            return {};
        const enrollments = await prisma.enrollment.findMany({
            where: { id: { in: context.enrollmentIds } },
            include: ENROLLMENT_INCLUDE,
        });
        const rows = {};
        for (const enrollment of enrollments) {
            rows[enrollment.id] = {};
            for (const field of fields) {
                rows[enrollment.id][field.fieldKey] = this.resolveFieldValue(field, enrollment);
            }
        }
        return rows;
    }
    resolveFieldValue(field, enrollment) {
        if (field.fieldCategory === FieldCategory.COMPUTED ||
            field.fieldCategory === FieldCategory.SUMMARY) {
            return null;
        }
        if (field.resolverType === FieldResolverType.RELATION) {
            const config = field.resolverConfig;
            const path = config?.path ?? [];
            return serializeFieldValue(getValueByPath(enrollment, path));
        }
        if (field.sourceTable === "Student" && field.sourceColumn) {
            const student = enrollment.student;
            return serializeFieldValue(student?.[field.sourceColumn] ?? null);
        }
        if (field.sourceTable === "Enrollment" && field.sourceColumn) {
            return serializeFieldValue(enrollment[field.sourceColumn] ?? null);
        }
        return null;
    }
}
export const studentProvider = new StudentProvider();
//# sourceMappingURL=student.provider.js.map