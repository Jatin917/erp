import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { templateEngine } from "@src/document-templates/engine/template-engine.js";

export const listSystemFields = async (req: any, res: any) => {
  try {
    const fields = await templateEngine.searchSystemFields({
      ...(req.query.entityType && { entityType: String(req.query.entityType) }),
      ...(req.query.q && { query: String(req.query.q) }),
    });
    return sendSuccess(res, "System fields fetched successfully", { fields }, HTTP_STATUS.OK);
  } catch (error) {
    const message = (error as Error).message;
    return sendError(res, message, message.includes("Unknown entity") ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const listSystemFieldsByEntity = async (req: any, res: any) => {
  try {
    const fields = await templateEngine.getSystemFieldsByEntity(req.params.entityType);
    return sendSuccess(res, "System fields fetched successfully", { fields }, HTTP_STATUS.OK);
  } catch (error) {
    const message = (error as Error).message;
    return sendError(res, message, message.includes("Unknown entity") ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};