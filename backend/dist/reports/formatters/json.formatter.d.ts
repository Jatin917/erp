import type { ReportRow, ReportRunMeta, ReportRunResponse } from "../types/report.types.js";
import { ReportFormatter } from "./report-formatter.abstract.js";
export declare class JsonFormatter extends ReportFormatter {
    readonly format: "json";
    formatReport(rows: ReportRow[], meta: ReportRunMeta): ReportRunResponse;
}
//# sourceMappingURL=json.formatter.d.ts.map