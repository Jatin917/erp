export class FormatterService {
    format(format, rows, meta) {
        if (format === "json") {
            return { format: "json", meta, rows };
        }
        return { format: "json", meta, rows };
    }
}
export const formatterService = new FormatterService();
//# sourceMappingURL=formatter.service.js.map