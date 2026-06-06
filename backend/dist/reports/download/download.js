export class Download {
    formats = new Map();
    constructor() {
        this.registerBuiltInFormats();
    }
    registerFormat(format, config) {
        this.formats.set(format.toLowerCase(), config);
        return this;
    }
    hasFormat(format) {
        return this.formats.has(format.toLowerCase());
    }
    toPayload(report, options) {
        const config = this.getFormatConfig(report.format);
        const body = config.serialize(report);
        const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body, "utf-8");
        return {
            fileName: this.buildFileName(report.format, options?.fileName, config.extension),
            mimeType: config.mimeType,
            fileContent: buffer.toString("base64"),
        };
    }
    /** Direct file attachment (e.g. browser navigation); not for axios/fetch. */
    send(res, report, options) {
        const payload = this.toPayload(report, options);
        const body = Buffer.from(payload.fileContent, "base64");
        res.setHeader("Content-Type", payload.mimeType);
        res.setHeader("Content-Disposition", 'attachment; filename="' + payload.fileName + '"');
        return res.status(200).send(body);
    }
    registerBuiltInFormats() {
        this.registerFormat("csv", {
            mimeType: "text/csv; charset=utf-8",
            extension: "csv",
            serialize: (report) => {
                if (report.content == null) {
                    throw new Error("CSV report has no content to download");
                }
                return report.content;
            },
        });
        this.registerFormat("json", {
            mimeType: "application/json; charset=utf-8",
            extension: "json",
            serialize: (report) => JSON.stringify({ meta: report.meta, rows: report.rows ?? [] }, null, 2),
        });
    }
    getFormatConfig(format) {
        const config = this.formats.get(String(format).toLowerCase());
        if (!config) {
            const supported = [...this.formats.keys()].join(", ");
            throw new Error("Unsupported download format: " + format + ". Supported formats: " + supported);
        }
        return config;
    }
    buildFileName(_format, baseName, extension) {
        const defaultBase = "report-" + new Date().toISOString().slice(0, 10);
        const safeBase = this.sanitizeFileName(baseName?.replace(/\.[^.]+$/, "") ?? defaultBase);
        return safeBase + "." + extension;
    }
    sanitizeFileName(name) {
        return name.replace(/[^\w.\-]/g, "_") || "report";
    }
}
export const reportDownload = new Download();
//# sourceMappingURL=download.js.map