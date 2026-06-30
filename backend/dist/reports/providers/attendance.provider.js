import { AttendanceStatus, FieldCategory, } from "../../../generated/prisma/index.js";
import { prisma } from "@src/server.js";
export class AttendanceProvider {
    key = "attendance";
    async fetch(context, fields) {
        if (fields.length === 0 || context.enrollmentIds.length === 0) {
            return {};
        }
        const rows = {};
        for (const id of context.enrollmentIds) {
            rows[id] = {};
        }
        const computedKeys = fields.filter((f) => f.fieldCategory === FieldCategory.COMPUTED ||
            f.fieldCategory === FieldCategory.SUMMARY);
        const rawKeys = fields.filter((f) => f.fieldCategory === FieldCategory.RAW);
        if (computedKeys.some((f) => f.fieldKey === "attendance_percentage")) {
            await this.fillAttendancePercentage(context.enrollmentIds, rows);
        }
        if (rawKeys.length > 0) {
            await this.fillLatestAttendanceRaw(context.enrollmentIds, rawKeys, rows);
        }
        for (const field of fields) {
            if (field.fieldCategory === FieldCategory.COMPUTED &&
                field.fieldKey !== "attendance_percentage") {
                for (const id of context.enrollmentIds) {
                    rows[id][field.fieldKey] = null;
                }
            }
        }
        return rows;
    }
    async fillAttendancePercentage(enrollmentIds, rows) {
        const grouped = await prisma.attendance.groupBy({
            by: ["enrollmentId", "status"],
            where: { enrollmentId: { in: enrollmentIds } },
            _count: { _all: true },
        });
        const stats = new Map();
        for (const id of enrollmentIds) {
            stats.set(id, { total: 0, present: 0 });
        }
        for (const row of grouped) {
            const current = stats.get(row.enrollmentId) ?? { total: 0, present: 0 };
            current.total += row._count._all;
            if (row.status === AttendanceStatus.PRESENT) {
                current.present += row._count._all;
            }
            stats.set(row.enrollmentId, current);
        }
        for (const [enrollmentId, { total, present }] of stats) {
            const pct = total === 0 ? null : Math.round((present / total) * 10000) / 100;
            if (!rows[enrollmentId])
                rows[enrollmentId] = {};
            rows[enrollmentId].attendance_percentage = pct;
        }
    }
    async fillLatestAttendanceRaw(enrollmentIds, fields, rows) {
        const latest = await prisma.attendance.findMany({
            where: { enrollmentId: { in: enrollmentIds } },
            orderBy: { markedAt: "desc" },
            distinct: ["enrollmentId"],
        });
        const byEnrollment = new Map(latest.map((a) => [a.enrollmentId, a]));
        for (const enrollmentId of enrollmentIds) {
            const record = byEnrollment.get(enrollmentId);
            if (!record)
                continue;
            if (!rows[enrollmentId])
                rows[enrollmentId] = {};
            for (const field of fields) {
                if (!field.sourceColumn)
                    continue;
                const value = record[field.sourceColumn];
                rows[enrollmentId][field.fieldKey] = value ?? null;
            }
        }
    }
}
export const attendanceProvider = new AttendanceProvider();
//# sourceMappingURL=attendance.provider.js.map