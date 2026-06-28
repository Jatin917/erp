import type { ReportRow, ReportRunMeta, ReportRunResponse } from "../types/report.types.js";
import { ReportFormatter } from "./report-formatter.abstract.js";

const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export class CsvFormatter extends ReportFormatter {
  readonly format = "csv" as const;

  formatReport(rows: ReportRow[], meta: ReportRunMeta): ReportRunResponse {
    const columns = this.resolveColumns(rows, meta);
    const headerLine = columns.map(escapeCsvCell).join(",");
    const dataLines = rows.map((row) =>
      columns.map((col) => escapeCsvCell(row[col])).join(",")
    );

    const content = [headerLine, ...dataLines].join("\r\n");

    return {
      format: this.format,
      meta,
      content,
    };
  }

  private resolveColumns(rows: ReportRow[], meta: ReportRunMeta): string[] {
    const columns = new Set<string>(meta.fields);
    if (rows.some((row) => "enrollmentId" in row)) {
      columns.add("enrollmentId");
    }
    return [...columns];
  }
}
