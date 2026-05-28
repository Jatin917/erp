import type { FieldRegistry, SourceModule } from "../../../generated/prisma/index.js";
export type ReportFormat = "json";
export type ReportFilters = Record<string, string | number | boolean>;
export interface ReportRunRequest {
    fields: string[];
    filters?: ReportFilters;
    format?: ReportFormat;
    branchId: string;
    sessionId?: string;
}
export interface ReportRunResponse {
    format: ReportFormat;
    meta: {
        rowCount: number;
        fields: string[];
        branchId: string;
        sessionId: string;
    };
    rows: ReportRow[];
}
export type ReportRow = Record<string, unknown>;
export interface ReportExecutionContext {
    branchId: string;
    sessionId: string;
    filters: ReportFilters;
    enrollmentIds: string[];
    registryByKey: Map<string, FieldRegistry>;
}
export type ProviderKey = "student" | "attendance" | "fees" | "custom";
export type ProviderGroupedFields = Partial<Record<ProviderKey, string[]>>;
/** enrollmentId -> fieldKey -> value */
export type ProviderFetchResult = Record<string, Record<string, unknown>>;
export type CachedFieldMeta = FieldRegistry;
export declare const PROVIDER_MODULE_MAP: Partial<Record<SourceModule, ProviderKey>>;
//# sourceMappingURL=report.types.d.ts.map