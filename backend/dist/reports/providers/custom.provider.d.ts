import { type FieldRegistry } from "../../../generated/prisma/index.js";
import type { ReportExecutionContext, ProviderFetchResult } from "../types/report.types.js";
import type { ReportProvider } from "../types/provider.types.js";
export declare class CustomProvider implements ReportProvider {
    readonly key: "custom";
    fetch(context: ReportExecutionContext, fields: FieldRegistry[]): Promise<ProviderFetchResult>;
}
export declare const customProvider: CustomProvider;
//# sourceMappingURL=custom.provider.d.ts.map