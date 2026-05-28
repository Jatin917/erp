import type { ReportRunRequest, ReportRunResponse } from "../types/report.types.js";
export declare class ReportEngine {
    run(request: ReportRunRequest): Promise<ReportRunResponse>;
    private resolveCurrentSessionId;
}
export declare const reportEngine: ReportEngine;
//# sourceMappingURL=report-engine.d.ts.map