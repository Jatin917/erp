import type { ReportFormat, ReportRow, ReportRunResponse } from "../types/report.types.js";
export declare class FormatterService {
    format(format: ReportFormat, rows: ReportRow[], meta: ReportRunResponse["meta"]): ReportRunResponse;
}
export declare const formatterService: FormatterService;
//# sourceMappingURL=formatter.service.d.ts.map