export class Template {
    id;
    name;
    description;
    pdfUrl;
    type;
    status;
    branchId;
    createdById;
    mappings;
    createdAt;
    updatedAt;
    constructor(data) {
        this.id = data.id ?? "";
        this.name = data.name;
        this.description = data.description ?? null;
        this.pdfUrl = data.pdfUrl;
        this.type = data.type ?? "CUSTOM";
        this.status = data.status ?? "DRAFT";
        this.branchId = data.branchId ?? null;
        this.createdById = data.createdById ?? null;
        this.mappings = data.mappings ?? [];
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
    toRecord() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            pdfUrl: this.pdfUrl,
            type: this.type,
            status: this.status,
            branchId: this.branchId,
            createdById: this.createdById,
            mappings: this.mappings,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
//# sourceMappingURL=template.abstract.js.map