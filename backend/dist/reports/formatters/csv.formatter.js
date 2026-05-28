import { ReportFormatter } from "./report-formatter.abstract.js";
const escapeCsvCell = (value) => {
    if (value === null || value === undefined)
        return "";
    const text = value instanceof Date
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
    format = "csv";
    formatReport(rows, meta) {
        const columns = this.resolveColumns(rows, meta);
        const headerLine = columns.map(escapeCsvCell).join(",");
        const dataLines = rows.map((row) => columns.map((col) => escapeCsvCell(row[col])).join(","));
        const content = [headerLine, ...dataLines].join("\r\n");
        return {
            format: this.format,
            meta,
            content,
        };
    }
    resolveColumns(rows, meta) {
        const columns = new Set(meta.fields);
        if (rows.some((row) => "enrollmentId" in row)) {
            columns.add("enrollmentId");
        }
        return [...columns];
    }
}
//# sourceMappingURL=csv.formatter.js.map