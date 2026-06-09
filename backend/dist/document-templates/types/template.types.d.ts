import type { DocumentTemplateType, FieldAlignment, TemplateStatus } from "../../../generated/prisma/index.js";
export interface TemplateFieldMappingRecord {
    id: string;
    templateId: string;
    systemFieldId: string;
    /** Placeholder/token in the PDF (e.g. "student_name" or "{{student_name}}").
     *  The Report Engine replaces this token with the actual value. */
    fieldKey: string;
    /** Optional label printed beside the value in the document (e.g. "Student Name:") */
    fieldLabel: string | null;
    pageNumber: number;
    xCoordinate: number;
    yCoordinate: number;
    width: number | null;
    height: number | null;
    fontSize: number | null;
    alignment: FieldAlignment;
    isRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TemplateRecord {
    id: string;
    name: string;
    description: string | null;
    pdfUrl: string;
    type: DocumentTemplateType;
    status: TemplateStatus;
    branchId: string | null;
    createdById: string | null;
    mappings: TemplateFieldMappingRecord[];
    createdAt: Date;
    updatedAt: Date;
}
export interface RegisterTemplateInput {
    name: string;
    pdfUrl: string;
    description?: string;
    type?: DocumentTemplateType;
    branchId?: string;
    createdById?: string;
}
export interface UpdateTemplateInput {
    name?: string;
    description?: string;
    pdfUrl?: string;
    type?: DocumentTemplateType;
    branchId?: string;
}
export interface TemplateFieldMappingInput {
    /** FieldRegistry.id — which ERP field to pull data from */
    systemFieldId: string;
    /** The placeholder in the PDF template the engine will replace */
    fieldKey: string;
    /** Optional label to render next to the value in the document */
    fieldLabel?: string;
    pageNumber?: number;
    xCoordinate: number;
    yCoordinate: number;
    width?: number;
    height?: number;
    fontSize?: number;
    alignment?: FieldAlignment;
    isRequired?: boolean;
}
export interface UpdateTemplateFieldMappingInput {
    systemFieldId?: string;
    fieldKey?: string;
    fieldLabel?: string;
    pageNumber?: number;
    xCoordinate?: number;
    yCoordinate?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    alignment?: FieldAlignment;
    isRequired?: boolean;
}
export interface ListTemplatesFilter {
    branchId?: string;
    type?: DocumentTemplateType;
    status?: TemplateStatus;
    createdById?: string;
}
export interface TemplateValidationResult {
    valid: boolean;
    errors: string[];
}
//# sourceMappingURL=template.types.d.ts.map