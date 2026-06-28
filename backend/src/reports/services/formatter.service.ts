import type {
  ReportFormat,
  ReportRow,
  ReportRunMeta,
  ReportRunResponse,
} from "../types/report.types.js";
import { CsvFormatter } from "../formatters/csv.formatter.js";
import { JsonFormatter } from "../formatters/json.formatter.js";
import type { ReportFormatter } from "../formatters/report-formatter.abstract.js";

export class FormatterService {
  private readonly formatters = new Map<ReportFormat, ReportFormatter>();

  constructor() {
    this.register(new JsonFormatter());
    this.register(new CsvFormatter());
  }

  register(formatter: ReportFormatter): void {
    this.formatters.set(formatter.format, formatter);
  }

  get(format: ReportFormat): ReportFormatter | undefined {
    return this.formatters.get(format);
  }

  format(
    format: ReportFormat,
    rows: ReportRow[],
    meta: ReportRunMeta
  ): ReportRunResponse {
    const formatter = this.formatters.get(format);
    if (!formatter) {
      throw new Error(`Unsupported report format: ${format}`);
    }
    return formatter.formatReport(rows, meta);
  }
}

export const formatterService = new FormatterService();
