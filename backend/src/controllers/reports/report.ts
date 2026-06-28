import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { reportDownload } from "@src/reports/download/index.js";
import { reportEngine } from "@src/reports/engine/report-engine.js";
import type { ReportRunRequest } from "@src/reports/types/report.types.js";

export const runReport = async (req: any, res: any) => {
  try {
    const body = req.body as Partial<ReportRunRequest>;
    const branchId =
      body.branchId ??
      (req.query.branchId as string | undefined) ??
      (req.user?.branchId as string | undefined);

    if (!branchId) {
      return sendError(res, "branchId is required", HTTP_STATUS.BAD_REQUEST);
    }

    if (!Array.isArray(body.fields) || body.fields.length === 0) {
      return sendError(
        res,
        "fields array is required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const rawLimit = body.limit ?? (body as { LIMIT?: number }).LIMIT;
    const limit =
      rawLimit !== undefined && rawLimit !== null ? Number(rawLimit) : undefined;
    const pageNo =
      body.pageNo !== undefined && body.pageNo !== null
        ? Number(body.pageNo)
        : undefined;

    if (limit !== undefined || pageNo !== undefined) {
      if (
        limit === undefined ||
        pageNo === undefined ||
        !Number.isFinite(limit) ||
        !Number.isFinite(pageNo) ||
        limit < 1 ||
        pageNo < 1
      ) {
        return sendError(
          res,
          "limit (or LIMIT) and pageNo must be positive numbers when paginating",
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const request: ReportRunRequest = {
      fields: body.fields,
      filters: body.filters ?? {},
      format: body.format ?? "json",
      branchId,
    };
    if (body.sessionId) request.sessionId = body.sessionId;
    if (limit !== undefined) request.limit = limit;
    if (pageNo !== undefined) request.pageNo = pageNo;

    const result = await reportEngine.run(request);

    const wantsFileDownload =
      result.format !== "json" ||
      body.download === true ||
      String(body.download) === "true";

    if (wantsFileDownload) {
      const downloadOptions = body.fileName ? { fileName: body.fileName } : undefined;

      if (body.downloadRaw === true || String(body.downloadRaw) === "true") {
        return reportDownload.send(res, result, downloadOptions);
      }

      const file = reportDownload.toPayload(result, downloadOptions);
      return sendSuccess(res, "Report downloaded successfully", file, HTTP_STATUS.OK);
    }

    return sendSuccess(res, "Report generated successfully", result, HTTP_STATUS.OK);
  } catch (error) {
    const message = (error as Error).message;
    const status = message.includes("Unknown field") ||
      message.includes("Inactive field") ||
      message.includes("required")
      ? HTTP_STATUS.BAD_REQUEST
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return sendError(res, message, status);
  }
};