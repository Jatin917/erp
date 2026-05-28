import type { ReportFormat, ReportRow, ReportRunMeta, ReportRunResponse } from "../types/report.types.js";
import type { ReportFormatter } from "../formatters/report-formatter.abstract.js";
export declare class FormatterService {
    private readonly formatters;
    constructor();
    register(formatter: ReportFormatter): void;
    get(format: ReportFormat): ReportFormatter | undefined;
    format(format: ReportFormat, rows: ReportRow[], meta: ReportRunMeta): ReportRunResponse;
}
export declare const formatterService: FormatterService;
//# sourceMappingURL=formatter.service.d.ts.map