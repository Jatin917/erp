import type { ProviderKey } from "../types/report.types.js";
import type { ReportProvider, ReportProviderWithScope } from "../types/provider.types.js";
export declare class ProviderRegistry {
    private readonly providers;
    constructor();
    register(provider: ReportProvider): void;
    get(key: ProviderKey): ReportProvider | undefined;
    getScopeProvider(): ReportProviderWithScope;
    getAll(): ReportProvider[];
}
export declare const providerRegistry: ProviderRegistry;
//# sourceMappingURL=provider.registry.d.ts.map