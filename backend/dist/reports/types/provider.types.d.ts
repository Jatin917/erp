import type { CachedFieldMeta, ProviderFetchResult, ProviderKey, ReportExecutionContext } from "./report.types.js";
export interface ReportProvider {
    readonly key: ProviderKey;
    fetch(context: ReportExecutionContext, fields: CachedFieldMeta[]): Promise<ProviderFetchResult>;
}
export interface ScopeResolution {
    enrollmentIds: string[];
    rows: ProviderFetchResult;
}
export interface ReportProviderWithScope extends ReportProvider {
    resolveScope(context: Omit<ReportExecutionContext, "enrollmentIds">, fields: CachedFieldMeta[]): Promise<ScopeResolution>;
}
//# sourceMappingURL=provider.types.d.ts.map