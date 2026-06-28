import type { Response } from "express";
import type { ReportFormat, ReportRunResponse } from "../types/report.types.js";

export interface DownloadOptions {
  fileName?: string;
}

export interface DownloadFormatConfig {
  mimeType: string;
  extension: string;
  serialize: (report: ReportRunResponse) => string | Buffer;
}

/** JSON payload for axios/fetch clients to trigger a browser download. */
export interface DownloadPayload {
  fileName: string;
  mimeType: string;
  fileContent: string;
}

export class Download {
  private readonly formats = new Map<string, DownloadFormatConfig>();

  constructor() {
    this.registerBuiltInFormats();
  }

  registerFormat(format: string, config: DownloadFormatConfig): this {
    this.formats.set(format.toLowerCase(), config);
    return this;
  }

  hasFormat(format: string): boolean {
    return this.formats.has(format.toLowerCase());
  }

  toPayload(report: ReportRunResponse, options?: DownloadOptions): DownloadPayload {
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
  send(res: Response, report: ReportRunResponse, options?: DownloadOptions): Response {
    const payload = this.toPayload(report, options);
    const body = Buffer.from(payload.fileContent, "base64");

    res.setHeader("Content-Type", payload.mimeType);
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + payload.fileName + '"'
    );
    return res.status(200).send(body);
  }

  private registerBuiltInFormats(): void {
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
      serialize: (report) =>
        JSON.stringify({ meta: report.meta, rows: report.rows ?? [] }, null, 2),
    });
  }

  private getFormatConfig(format: ReportFormat | string): DownloadFormatConfig {
    const config = this.formats.get(String(format).toLowerCase());
    if (!config) {
      const supported = [...this.formats.keys()].join(", ");
      throw new Error(
        "Unsupported download format: " + format + ". Supported formats: " + supported
      );
    }
    return config;
  }

  private buildFileName(_format: string, baseName: string | undefined, extension: string): string {
    const defaultBase = "report-" + new Date().toISOString().slice(0, 10);
    const safeBase = this.sanitizeFileName(baseName?.replace(/\.[^.]+$/, "") ?? defaultBase);
    return safeBase + "." + extension;
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^\w.\-]/g, "_") || "report";
  }
}

export const reportDownload = new Download();
