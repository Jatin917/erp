import { CsvFormatter } from "../formatters/csv.formatter.js";
import { JsonFormatter } from "../formatters/json.formatter.js";
export class FormatterService {
    formatters = new Map();
    constructor() {
        this.register(new JsonFormatter());
        this.register(new CsvFormatter());
    }
    register(formatter) {
        this.formatters.set(formatter.format, formatter);
    }
    get(format) {
        return this.formatters.get(format);
    }
    format(format, rows, meta) {
        const formatter = this.formatters.get(format);
        if (!formatter) {
            throw new Error(`Unsupported report format: ${format}`);
        }
        return formatter.formatReport(rows, meta);
    }
}
export const formatterService = new FormatterService();
//# sourceMappingURL=formatter.service.js.map