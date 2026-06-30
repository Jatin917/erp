import { prisma } from "@src/server.js";
import { fieldRegistryService } from "../services/field-registry.service.js";
import { fieldGroupingService } from "../services/field-grouping.service.js";
import { aggregatorService } from "../services/aggregator.service.js";
import { formatterService } from "../services/formatter.service.js";
import { providerRegistry } from "../providers/provider.registry.js";
export class ReportEngine {
    async run(request) {
        await fieldRegistryService.ensureLoaded();
        const format = request.format ?? "json";
        const filters = request.filters ?? {};
        const fieldKeys = [...new Set(request.fields)];
        const registryFields = fieldRegistryService.validateReportFields(fieldKeys);
        const registryByKey = new Map(registryFields.map((f) => [f.fieldKey, f]));
        const sessionId = request.sessionId ??
            (await this.resolveCurrentSessionId(request.branchId));
        const grouped = fieldGroupingService.group(registryFields);
        const scopeProvider = providerRegistry.getScopeProvider();
        const studentFieldKeys = grouped.student ?? [];
        const studentFields = studentFieldKeys
            .map((k) => registryByKey.get(k))
            .filter((f) => Boolean(f));
        const { enrollmentIds, rows: scopeRows } = await scopeProvider.resolveScope({
            branchId: request.branchId,
            sessionId,
            filters,
            registryByKey,
            ...(request.limit != null && { limit: request.limit }),
            ...(request.pageNo != null && { pageNo: request.pageNo }),
        }, studentFields);
        const context = {
            branchId: request.branchId,
            sessionId,
            filters,
            enrollmentIds,
            registryByKey,
        };
        const providerResults = [scopeRows];
        const parallelKeys = ["attendance", "fees", "custom"];
        const parallelTasks = parallelKeys
            .filter((key) => grouped[key]?.length)
            .map(async (key) => {
            const provider = providerRegistry.get(key);
            if (!provider)
                return {};
            const keys = grouped[key];
            const fields = keys
                .map((k) => registryByKey.get(k))
                .filter((f) => Boolean(f));
            if (key === "student")
                return {};
            return provider.fetch(context, fields);
        });
        const parallelResults = await Promise.all(parallelTasks);
        providerResults.push(...parallelResults);
        const mergedRows = aggregatorService.merge(enrollmentIds, fieldKeys, providerResults);
        const response = formatterService.format(format, mergedRows, {
            rowCount: mergedRows.length,
            fields: fieldKeys,
            branchId: request.branchId,
            sessionId,
            ...(request.limit != null && { limit: request.limit }),
            ...(request.pageNo != null && { pageNo: request.pageNo }),
        });
        return response;
    }
    async resolveCurrentSessionId(branchId) {
        const session = await prisma.academicSession.findFirst({
            where: { branchId, isCurrent: true },
            select: { id: true },
        });
        if (!session) {
            throw new Error("No current academic session found for this branch");
        }
        return session.id;
    }
}
export const reportEngine = new ReportEngine();
//# sourceMappingURL=report-engine.js.map