import type {
  ReportFormat,
  ReportRow,
  ReportRunMeta,
  ReportRunResponse,
} from "../types/report.types.js";

export abstract class ReportFormatter {
  abstract readonly format: ReportFormat;

  abstract formatReport(
    rows: ReportRow[],
    meta: ReportRunMeta
  ): ReportRunResponse;
}
