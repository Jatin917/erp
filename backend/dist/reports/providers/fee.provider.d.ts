import { type FieldRegistry } from "../../../generated/prisma/index.js";
import type { ReportExecutionContext, ProviderFetchResult } from "../types/report.types.js";
import type { ReportProvider } from "../types/provider.types.js";
export declare class FeeProvider implements ReportProvider {
    readonly key: "fees";
    fetch(context: ReportExecutionContext, fields: FieldRegistry[]): Promise<ProviderFetchResult>;
    private fillPendingFees;
    private fillTotalFeesPaid;
    private fillLatestFeeDocRaw;
}
export declare const feeProvider: FeeProvider;
//# sourceMappingURL=fee.provider.d.ts.map