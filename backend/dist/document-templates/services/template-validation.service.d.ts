import type { TemplateStatus } from "../../../generated/prisma/index.js";
import type { RegisterTemplateInput, TemplateFieldMappingInput, TemplateRecord, TemplateValidationResult, UpdateTemplateFieldMappingInput } from "../types/template.types.js";
export declare class TemplateValidationService {
    validateRegistration(input: RegisterTemplateInput): void;
    validateCoordinates(pageNumber: number, xCoordinate: number, yCoordinate: number, width?: number | null, height?: number | null): void;
    validateMappingInput(mapping: TemplateFieldMappingInput): void;
    validateMappingUpdate(input: UpdateTemplateFieldMappingInput): void;
    validateTemplateRecord(template: TemplateRecord, options?: {
        requireMappings?: boolean;
    }): Promise<TemplateValidationResult>;
    assertMutableStatus(status: TemplateStatus): void;
}
export declare const templateValidationService: TemplateValidationService;
//# sourceMappingURL=template-validation.service.d.ts.map