import { HTTP_STATUS } from "../../lib/http-codes.js";
import { sendError, sendSuccess } from "../../lib/utils.js";
import { reportDownload } from "../../reports/download/index.js";
import { reportEngine } from "../../reports/engine/report-engine.js";
export const runReport = async (req, res) => {
    try {
        const body = req.body;
        const branchId = body.branchId ??
            req.query.branchId ??
            req.user?.branchId;
        if (!branchId) {
            return sendError(res, "branchId is required", HTTP_STATUS.BAD_REQUEST);
        }
        if (!Array.isArray(body.fields) || body.fields.length === 0) {
            return sendError(res, "fields array is required", HTTP_STATUS.BAD_REQUEST);
        }
        const rawLimit = body.limit ?? body.LIMIT;
        const limit = rawLimit !== undefined && rawLimit !== null ? Number(rawLimit) : undefined;
        const pageNo = body.pageNo !== undefined && body.pageNo !== null
            ? Number(body.pageNo)
            : undefined;
        if (limit !== undefined || pageNo !== undefined) {
            if (limit === undefined ||
                pageNo === undefined ||
                !Number.isFinite(limit) ||
                !Number.isFinite(pageNo) ||
                limit < 1 ||
                pageNo < 1) {
                return sendError(res, "limit (or LIMIT) and pageNo must be positive numbers when paginating", HTTP_STATUS.BAD_REQUEST);
            }
        }
        const request = {
            fields: body.fields,
            filters: body.filters ?? {},
            format: body.format ?? "json",
            branchId,
        };
        if (body.sessionId)
            request.sessionId = body.sessionId;
        if (limit !== undefined)
            request.limit = limit;
        if (pageNo !== undefined)
            request.pageNo = pageNo;
        const result = await reportEngine.run(request);
        const wantsFileDownload = result.format !== "json" ||
            body.download === true ||
            String(body.download) === "true";
        if (wantsFileDownload) {
            return reportDownload.send(res, result, { fileName: body.fileName ?? "" });
        }
        return sendSuccess(res, "Report generated successfully", result, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        const status = message.includes("Unknown field") ||
            message.includes("Inactive field") ||
            message.includes("required")
            ? HTTP_STATUS.BAD_REQUEST
            : HTTP_STATUS.INTERNAL_SERVER_ERROR;
        return sendError(res, message, status);
    }
};
//# sourceMappingURL=report.js.map