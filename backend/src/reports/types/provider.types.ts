import type {
  CachedFieldMeta,
  ProviderFetchResult,
  ProviderKey,
  ReportExecutionContext,
  ReportScopeContext,
} from "./report.types.js";

export interface ReportProvider {
  readonly key: ProviderKey;
  fetch(
    context: ReportExecutionContext,
    fields: CachedFieldMeta[]
  ): Promise<ProviderFetchResult>;
}

export interface ScopeResolution {
  enrollmentIds: string[];
  rows: ProviderFetchResult;
}

export interface ReportProviderWithScope extends ReportProvider {
  resolveScope(
    context: ReportScopeContext,
    fields: CachedFieldMeta[]
  ): Promise<ScopeResolution>;
}
