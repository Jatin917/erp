import { HTTP_STATUS } from "@src/lib/http-codes.js";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { fieldRegistryService } from "@src/reports/services/field-registry.service.js";
export const getReportFields = async (req, res) => {
    try {
        const sourceModule = req.query.sourceModule;
        const groupKey = req.query.groupKey;
        const filters = {};
        if (sourceModule)
            filters.sourceModule = sourceModule;
        if (groupKey)
            filters.groupKey = groupKey;
        await fieldRegistryService.ensureLoaded();
        const fields = fieldRegistryService.list(filters).map(({ fieldKey, label }) => ({
            key: fieldKey,
            label,
        }));
        return sendSuccess(res, "Report fields fetched successfully", { fields }, HTTP_STATUS.OK);
    }
    catch (error) {
        return sendError(res, error.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
//# sourceMappingURL=field-registry.js.map