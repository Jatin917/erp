import type { ProviderFetchResult } from "../types/report.types.js";
import type { ReportRow } from "../types/report.types.js";

export class AggregatorService {
  /**
   * Merge provider payloads into report rows keyed by fieldKey (not DB columns).
   */
  merge(
    enrollmentIds: string[],
    fieldKeys: string[],
    providerResults: ProviderFetchResult[]
  ): ReportRow[] {
    return enrollmentIds.map((enrollmentId) => {
      const row: ReportRow = { enrollmentId };

      for (const fieldKey of fieldKeys) {
        let value: unknown = null;
        for (const chunk of providerResults) {
          const fromProvider = chunk[enrollmentId]?.[fieldKey];
          if (fromProvider !== undefined && fromProvider !== null) {
            value = fromProvider;
            break;
          }
        }
        row[fieldKey] = value;
      }

      return row;
    });
  }
}

export const aggregatorService = new AggregatorService();
