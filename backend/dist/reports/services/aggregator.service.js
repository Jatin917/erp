export class AggregatorService {
    /**
     * Merge provider payloads into report rows keyed by fieldKey (not DB columns).
     */
    merge(enrollmentIds, fieldKeys, providerResults) {
        return enrollmentIds.map((enrollmentId) => {
            const row = { enrollmentId };
            for (const fieldKey of fieldKeys) {
                let value = null;
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
//# sourceMappingURL=aggregator.service.js.map