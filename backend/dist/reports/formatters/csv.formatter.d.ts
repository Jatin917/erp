import type { ReportRow, ReportRunMeta, ReportRunResponse } from "../types/report.types.js";
import { ReportFormatter } from "./report-formatter.abstract.js";
export declare class CsvFormatter extends ReportFormatter {
    readonly format: "csv";
    formatReport(rows: ReportRow[], meta: ReportRunMeta): ReportRunResponse;
    private resolveColumns;
}
//# sourceMappingURL=csv.formatter.d.ts.map