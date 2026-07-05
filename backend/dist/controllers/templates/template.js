import { HTTP_STATUS } from "../../lib/http-codes.js";
import { sendError, sendSuccess } from "../../lib/utils.js";
import { templateEngine } from "../../document-templates/engine/template-engine.js";
const badRequest = (message) => message.includes("required") || message.includes("not found") || message.includes("Unknown") || message.includes("cannot");
export const createTemplate = async (req, res) => {
    try {
        const body = req.body;
        if (!body.name || !body.pdfUrl) {
            return sendError(res, "name and pdfUrl are required", HTTP_STATUS.BAD_REQUEST);
        }
        const input = {
            name: body.name,
            pdfUrl: body.pdfUrl,
        };
        if (body.description != null)
            input.description = body.description;
        if (body.type != null)
            input.type = body.type;
        if (body.branchId != null)
            input.branchId = body.branchId;
        if (req.user?.id)
            input.createdById = req.user.id;
        const template = await templateEngine.registerTemplate(input);
        return sendSuccess(res, "Template registered successfully", { template }, HTTP_STATUS.CREATED);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const listTemplates = async (req, res) => {
    try {
        const filters = {};
        if (req.query.branchId)
            filters.branchId = String(req.query.branchId);
        if (req.query.type)
            filters.type = req.query.type;
        if (req.query.status)
            filters.status = req.query.status;
        const templates = await templateEngine.listTemplates(filters);
        return sendSuccess(res, "Templates fetched successfully", { templates }, HTTP_STATUS.OK);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const getTemplate = async (req, res) => {
    try {
        const template = await templateEngine.getTemplate(req.params.id);
        return sendSuccess(res, "Template fetched successfully", { template }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, message.includes("not found") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const updateTemplate = async (req, res) => {
    try {
        const body = req.body;
        const template = await templateEngine.updateTemplate(req.params.id, body);
        return sendSuccess(res, "Template updated successfully", { template }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const deleteTemplate = async (req, res) => {
    try {
        await templateEngine.deleteTemplate(req.params.id);
        return sendSuccess(res, "Template deleted successfully", undefined, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const activateTemplate = async (req, res) => {
    try {
        const template = await templateEngine.activateTemplate(req.params.id);
        return sendSuccess(res, "Template activated successfully", { template }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const archiveTemplate = async (req, res) => {
    try {
        const template = await templateEngine.archiveTemplate(req.params.id);
        return sendSuccess(res, "Template archived successfully", { template }, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, badRequest(message) ? HTTP_STATUS.BAD_REQUEST : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const validateTemplate = async (req, res) => {
    try {
        const result = await templateEngine.validateTemplate(req.params.id);
        return sendSuccess(res, "Template validation completed", result, HTTP_STATUS.OK);
    }
    catch (error) {
        const message = error.message;
        return sendError(res, message, message.includes("not found") ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=template.js.map