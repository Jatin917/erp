import {
  FieldCategory,
  FieldResolverType,
  type FieldRegistry,
} from "../../../generated/prisma/index.js";
import { prisma } from "@src/server.js";
import type {
  ProviderFetchResult,
  ReportExecutionContext,
  ReportScopeContext,
} from "../types/report.types.js";
import type { ReportProviderWithScope, ScopeResolution } from "../types/provider.types.js";
import { buildEnrollmentWhere } from "../utils/enrollment-filters.js";
import { getValueByPath, serializeFieldValue } from "../utils/path-resolver.js";

const ENROLLMENT_INCLUDE = {
  student: true,
  session: true,
  class: { include: { classLabel: true, section: true } },
} as const;

export class StudentProvider implements ReportProviderWithScope {
  readonly key = "student" as const;

  async resolveScope(
    context: ReportScopeContext,
    fields: FieldRegistry[]
  ): Promise<ScopeResolution> {
    const where = buildEnrollmentWhere(
      context.branchId,
      context.sessionId,
      context.filters
    );
    const orderBy = [{ rollNo: "asc" as const }, { createdAt: "asc" as const }];

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: ENROLLMENT_INCLUDE,
      orderBy,
      ...(context.limit != null &&
        context.pageNo != null && {
          skip: (context.pageNo - 1) * context.limit,
          take: context.limit,
        }),
    });

    const enrollmentIds = enrollments.map((e) => e.id);
    const rows: ProviderFetchResult = {};

    for (const enrollment of enrollments) {
      rows[enrollment.id] = {};
      for (const field of fields) {
        rows[enrollment.id]![field.fieldKey] = this.resolveFieldValue(
          field,
          enrollment
        );
      }
    }

    return { enrollmentIds, rows };
  }

  async fetch(
    context: ReportExecutionContext,
    fields: FieldRegistry[]
  ): Promise<ProviderFetchResult> {
    if (fields.length === 0) return {};

    const enrollments = await prisma.enrollment.findMany({
      where: { id: { in: context.enrollmentIds } },
      include: ENROLLMENT_INCLUDE,
    });

    const rows: ProviderFetchResult = {};
    for (const enrollment of enrollments) {
      rows[enrollment.id] = {};
      for (const field of fields) {
        rows[enrollment.id]![field.fieldKey] = this.resolveFieldValue(
          field,
          enrollment
        );
      }
    }
    return rows;
  }

  private resolveFieldValue(
    field: FieldRegistry,
    enrollment: Record<string, unknown>
  ): unknown {
    if (
      field.fieldCategory === FieldCategory.COMPUTED ||
      field.fieldCategory === FieldCategory.SUMMARY
    ) {
      return null;
    }

    if (field.resolverType === FieldResolverType.RELATION) {
      const config = field.resolverConfig as { path?: string[] } | null;
      const path = config?.path ?? [];
      return serializeFieldValue(getValueByPath(enrollment, path));
    }

    if (field.sourceTable === "Student" && field.sourceColumn) {
      const student = enrollment.student as Record<string, unknown> | undefined;
      return serializeFieldValue(student?.[field.sourceColumn] ?? null);
    }

    if (field.sourceTable === "Enrollment" && field.sourceColumn) {
      return serializeFieldValue(enrollment[field.sourceColumn] ?? null);
    }

    return null;
  }
}

export const studentProvider = new StudentProvider();
