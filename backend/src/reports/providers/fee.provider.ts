import {
  FieldCategory,
  PaymentStatus,
  type FieldRegistry,
} from "../../../generated/prisma/index.js";
import { prisma } from "@src/server.js";
import type { ReportExecutionContext, ProviderFetchResult } from "../types/report.types.js";
import type { ReportProvider } from "../types/provider.types.js";

export class FeeProvider implements ReportProvider {
  readonly key = "fees" as const;

  async fetch(
    context: ReportExecutionContext,
    fields: FieldRegistry[]
  ): Promise<ProviderFetchResult> {
    if (fields.length === 0 || context.enrollmentIds.length === 0) {
      return {};
    }

    const rows: ProviderFetchResult = {};
    for (const id of context.enrollmentIds) {
      rows[id] = {};
    }

    const fieldKeys = new Set(fields.map((f) => f.fieldKey));

    if (fieldKeys.has("pending_fees")) {
      await this.fillPendingFees(context.enrollmentIds, rows);
    }

    if (fieldKeys.has("total_fees_paid")) {
      await this.fillTotalFeesPaid(context.enrollmentIds, rows);
    }

    const rawFields = fields.filter((f) => f.fieldCategory === FieldCategory.RAW);
    if (rawFields.length > 0) {
      await this.fillLatestFeeDocRaw(context.enrollmentIds, rawFields, rows);
    }

    for (const field of fields) {
      if (
        field.fieldCategory === FieldCategory.COMPUTED &&
        !["pending_fees", "total_fees_paid"].includes(field.fieldKey)
      ) {
        for (const id of context.enrollmentIds) {
          rows[id]![field.fieldKey] = null;
        }
      }
    }

    return rows;
  }

  private async fillPendingFees(
    enrollmentIds: string[],
    rows: ProviderFetchResult
  ): Promise<void> {
    const docs = await prisma.feeDoc.groupBy({
      by: ["enrollmentId"],
      where: {
        enrollmentId: { in: enrollmentIds },
        status: { in: [PaymentStatus.PENDING, PaymentStatus.PARTIAL] },
      },
      _sum: { amount: true, afterAmount: true },
    });

    for (const row of docs) {
      if (!rows[row.enrollmentId]) rows[row.enrollmentId] = {};
      const sum = row._sum.afterAmount ?? row._sum.amount ?? 0;
      rows[row.enrollmentId]!.pending_fees = sum;
    }

    for (const id of enrollmentIds) {
      if (rows[id]?.pending_fees === undefined) {
        if (!rows[id]) rows[id] = {};
        rows[id]!.pending_fees = 0;
      }
    }
  }

  private async fillTotalFeesPaid(
    enrollmentIds: string[],
    rows: ProviderFetchResult
  ): Promise<void> {
    const txs = await prisma.feeTransaction.groupBy({
      by: ["enrollmentId"],
      where: { enrollmentId: { in: enrollmentIds } },
      _sum: { amountPaid: true },
    });

    for (const row of txs) {
      if (!rows[row.enrollmentId]) rows[row.enrollmentId] = {};
      rows[row.enrollmentId]!.total_fees_paid = row._sum.amountPaid ?? 0;
    }

    for (const id of enrollmentIds) {
      if (rows[id]?.total_fees_paid === undefined) {
        if (!rows[id]) rows[id] = {};
        rows[id]!.total_fees_paid = 0;
      }
    }
  }

  private async fillLatestFeeDocRaw(
    enrollmentIds: string[],
    fields: FieldRegistry[],
    rows: ProviderFetchResult
  ): Promise<void> {
    const docs = await prisma.feeDoc.findMany({
      where: { enrollmentId: { in: enrollmentIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["enrollmentId"],
    });

    const byEnrollment = new Map(docs.map((d) => [d.enrollmentId, d]));

    for (const enrollmentId of enrollmentIds) {
      const doc = byEnrollment.get(enrollmentId);
      if (!doc) continue;
      if (!rows[enrollmentId]) rows[enrollmentId] = {};

      for (const field of fields) {
        if (field.sourceTable !== "FeeDoc" || !field.sourceColumn) continue;
        const value = (doc as Record<string, unknown>)[field.sourceColumn];
        rows[enrollmentId]![field.fieldKey] = value ?? null;
      }
    }
  }
}

export const feeProvider = new FeeProvider();
