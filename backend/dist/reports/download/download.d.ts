import type { Response } from "express";
import type { ReportRunResponse } from "../types/report.types.js";
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
export declare class Download {
    private readonly formats;
    constructor();
    registerFormat(format: string, config: DownloadFormatConfig): this;
    hasFormat(format: string): boolean;
    toPayload(report: ReportRunResponse, options?: DownloadOptions): DownloadPayload;
    /** Direct file attachment (e.g. browser navigation); not for axios/fetch. */
    send(res: Response, report: ReportRunResponse, options?: DownloadOptions): Response;
    private registerBuiltInFormats;
    private getFormatConfig;
    private buildFileName;
    private sanitizeFileName;
}
export declare const reportDownload: Download;
//# sourceMappingURL=download.d.ts.map