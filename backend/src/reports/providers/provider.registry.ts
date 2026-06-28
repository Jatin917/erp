import type { ProviderKey } from "../types/report.types.js";
import type { ReportProvider, ReportProviderWithScope } from "../types/provider.types.js";
import { attendanceProvider } from "./attendance.provider.js";
import { customProvider } from "./custom.provider.js";
import { feeProvider } from "./fee.provider.js";
import { studentProvider } from "./student.provider.js";

export class ProviderRegistry {
  private readonly providers = new Map<ProviderKey, ReportProvider>();

  constructor() {
    this.register(studentProvider);
    this.register(attendanceProvider);
    this.register(feeProvider);
    this.register(customProvider);
  }

  register(provider: ReportProvider): void {
    this.providers.set(provider.key, provider);
  }

  get(key: ProviderKey): ReportProvider | undefined {
    return this.providers.get(key);
  }

  getScopeProvider(): ReportProviderWithScope {
    return studentProvider;
  }

  getAll(): ReportProvider[] {
    return [...this.providers.values()];
  }
}

export const providerRegistry = new ProviderRegistry();
