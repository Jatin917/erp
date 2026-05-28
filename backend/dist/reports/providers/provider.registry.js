import { attendanceProvider } from "./attendance.provider.js";
import { customProvider } from "./custom.provider.js";
import { feeProvider } from "./fee.provider.js";
import { studentProvider } from "./student.provider.js";
export class ProviderRegistry {
    providers = new Map();
    constructor() {
        this.register(studentProvider);
        this.register(attendanceProvider);
        this.register(feeProvider);
        this.register(customProvider);
    }
    register(provider) {
        this.providers.set(provider.key, provider);
    }
    get(key) {
        return this.providers.get(key);
    }
    getScopeProvider() {
        return studentProvider;
    }
    getAll() {
        return [...this.providers.values()];
    }
}
export const providerRegistry = new ProviderRegistry();
//# sourceMappingURL=provider.registry.js.map