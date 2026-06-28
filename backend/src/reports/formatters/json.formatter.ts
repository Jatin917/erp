import type { ReportRow, ReportRunMeta, ReportRunResponse } from "../types/report.types.js";
import { ReportFormatter } from "./report-formatter.abstract.js";

export class JsonFormatter extends ReportFormatter {
  readonly format = "json" as const;

  formatReport(rows: ReportRow[], meta: ReportRunMeta): ReportRunResponse {
    return {
      format: this.format,
      meta,
      rows,
    };
  }
}
