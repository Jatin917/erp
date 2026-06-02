import { type FieldRegistry } from "../../../generated/prisma/index.js";
import type { ProviderFetchResult, ReportExecutionContext, ReportScopeContext } from "../types/report.types.js";
import type { ReportProviderWithScope, ScopeResolution } from "../types/provider.types.js";
export declare class StudentProvider implements ReportProviderWithScope {
    readonly key: "student";
    resolveScope(context: ReportScopeContext, fields: FieldRegistry[]): Promise<ScopeResolution>;
    fetch(context: ReportExecutionContext, fields: FieldRegistry[]): Promise<ProviderFetchResult>;
    private resolveFieldValue;
}
export declare const studentProvider: StudentProvider;
//# sourceMappingURL=student.provider.d.ts.map