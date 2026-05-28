import type { ProviderFetchResult } from "../types/report.types.js";
import type { ReportRow } from "../types/report.types.js";
export declare class AggregatorService {
    /**
     * Merge provider payloads into report rows keyed by fieldKey (not DB columns).
     */
    merge(enrollmentIds: string[], fieldKeys: string[], providerResults: ProviderFetchResult[]): ReportRow[];
}
export declare const aggregatorService: AggregatorService;
//# sourceMappingURL=aggregator.service.d.ts.map