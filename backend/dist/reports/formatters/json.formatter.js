import { ReportFormatter } from "./report-formatter.abstract.js";
export class JsonFormatter extends ReportFormatter {
    format = "json";
    formatReport(rows, meta) {
        return {
            format: this.format,
            meta,
            rows,
        };
    }
}
//# sourceMappingURL=json.formatter.js.map