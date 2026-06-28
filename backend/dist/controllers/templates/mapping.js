import { HTTP_STATUS } from "../../lib/http-codes.js";
import { sendError, sendSuccess } from "../../lib/utils.js";
import { templateEngine } from "../../document-templates/engine/template-engine.js";
const badRequest = (message) => message.includes("required") ||
    message.includes("not found") ||
    message.includes("Unknown") ||
    message.includes("Duplicate") ||
    message.includes("Archived") ||
    message.includes("Coordinates") ||
    message.includes("Inactive");
export const listMappings = async (req, res) => {
    try {
        const mappings = await templateEngine.getMappings(req.params.id);
        return sendSuccess(res, "Mappings fetched successfully", { mappings }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, message.includes("not found") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const addMapping = async (req, res) => {
    try {
        const body = req.body;
        if (!body.systemFieldId || !body.fieldKey || body.xCoordinate == null || body.yCoordinate == null) {
            return sendError(res, "systemFieldId, fieldKey, xCoordinate and yCoordinate are required", HTTP_STATUS.BAD_REQUEST);
        }
        const input = {
            systemFieldId: body.systemFieldId,
            fieldKey: body.fieldKey,
            xCoordinate: Number(body.xCoordinate),
            yCoordinate: Number(body.yCoordinate),
        };
        if (body.fieldLabel != null)
            input.fieldLabel = body.fieldLabel;
        if (body.pageNumber != null)
            input.pageNumber = Number(body.pageNumber);
        if (body.width != null)
            input.width = Number(body.width);
        if (body.height != null)
            input.height = Number(body.height);
        if (body.fontSize != null)
            input.fontSize = Number(body.fontSize);
        if (body.alignment != null)
            input.alignment = body.alignment;
        if (body.isRequired != null)
            input.isRequired = Boolean(body.isRequired);
        const mapping = await templateEngine.addMapping(req.params.id, input);
        return sendSuccess(res, "Mapping added successfully", { mapping }, HTTP_STATUS.CREATED);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const updateMapping = async (req, res) => {
    try {
        const body = req.body;
        const mapping = await templateEngine.updateMapping(req.params.id, req.params.mappingId, body);
        return sendSuccess(res, "Mapping updated successfully", { mapping }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const removeMapping = async (req, res) => {
    try {
        await templateEngine.removeMapping(req.params.id, req.params.mappingId);
        return sendSuccess(res, "Mapping removed successfully", undefined, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=mapping.js.map