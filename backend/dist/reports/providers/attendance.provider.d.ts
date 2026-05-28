import { type FieldRegistry } from "../../../generated/prisma/index.js";
import type { ReportExecutionContext, ProviderFetchResult } from "../types/report.types.js";
import type { ReportProvider } from "../types/provider.types.js";
export declare class AttendanceProvider implements ReportProvider {
    readonly key: "attendance";
    fetch(context: ReportExecutionContext, fields: FieldRegistry[]): Promise<ProviderFetchResult>;
    private fillAttendancePercentage;
    private fillLatestAttendanceRaw;
}
export declare const attendanceProvider: AttendanceProvider;
//# sourceMappingURL=attendance.provider.d.ts.map