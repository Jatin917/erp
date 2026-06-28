import { systemFieldRegistryService } from "./system-field-registry.service.js";
const MAX_PAGE_DIMENSION = 10000;
export class TemplateValidationService {
    validateRegistration(input) {
        const errors = [];
        if (!input.name?.trim())
            errors.push("Template name is required");
        if (!input.pdfUrl?.trim())
            errors.push("Template PDF is required");
        if (errors.length)
            throw new Error(errors.join("; "));
    }
    validateCoordinates(pageNumber, xCoordinate, yCoordinate, width, height) {
        const errors = [];
        if (pageNumber < 1)
            errors.push("pageNumber must be >= 1");
        if (xCoordinate < 0 || yCoordinate < 0)
            errors.push("Coordinates must be >= 0");
        if (xCoordinate > MAX_PAGE_DIMENSION || yCoordinate > MAX_PAGE_DIMENSION) {
            errors.push("Coordinates exceed page bounds");
        }
        if (width != null && width < 0)
            errors.push("width must be >= 0");
        if (height != null && height < 0)
            errors.push("height must be >= 0");
        if (errors.length)
            throw new Error(errors.join("; "));
    }
    validateMappingInput(mapping) {
        if (!mapping.systemFieldId?.trim())
            throw new Error("systemFieldId is required");
        if (!mapping.fieldKey?.trim())
            throw new Error("fieldKey is required");
        this.validateCoordinates(mapping.pageNumber ?? 1, mapping.xCoordinate, mapping.yCoordinate, mapping.width, mapping.height);
    }
    validateMappingUpdate(input) {
        if (input.pageNumber != null ||
            input.xCoordinate != null ||
            input.yCoordinate != null ||
            input.width != null ||
            input.height != null) {
            this.validateCoordinates(input.pageNumber ?? 1, input.xCoordinate ?? 0, input.yCoordinate ?? 0, input.width, input.height);
        }
    }
    async validateTemplateRecord(template, options) {
        const errors = [];
        const requireMappings = options?.requireMappings ?? template.status === "ACTIVE";
        if (!template.pdfUrl?.trim())
            errors.push("Template must contain a PDF");
        if (requireMappings && template.mappings.length === 0) {
            errors.push("Active templates must have at least one mapping");
        }
        const seenSystemFields = new Set();
        const seenFieldKeys = new Set();
        for (const mapping of template.mappings) {
            if (seenSystemFields.has(mapping.systemFieldId)) {
                errors.push("Duplicate system field mapping: " + mapping.systemFieldId);
            }
            seenSystemFields.add(mapping.systemFieldId);
            if (seenFieldKeys.has(mapping.fieldKey)) {
                errors.push("Duplicate fieldKey in template: " + mapping.fieldKey);
            }
            seenFieldKeys.add(mapping.fieldKey);
            if (!mapping.fieldKey?.trim()) {
                errors.push("Each mapping must have a fieldKey");
            }
            try {
                this.validateCoordinates(mapping.pageNumber, mapping.xCoordinate, mapping.yCoordinate, mapping.width, mapping.height);
                await systemFieldRegistryService.validateFieldExists(mapping.systemFieldId);
            }
            catch (error) {
                errors.push(error.message);
            }
        }
        return { valid: errors.length === 0, errors };
    }
    assertMutableStatus(status) {
        if (status === "ARCHIVED") {
            throw new Error("Archived templates cannot be modified");
        }
    }
}
export const templateValidationService = new TemplateValidationService();
//# sourceMappingURL=template-validation.service.js.map