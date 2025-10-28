import type { Prisma } from "@prisma/client/extension";
export declare const createSchoolDays: ({ tx, sessionId, startDate, endDate, workingDays }: {
    tx: Prisma.TransactionClient;
    sessionId: string;
    startDate: Date;
    endDate: Date;
    workingDays: number[];
}) => Promise<{
    success: boolean;
    total: number;
} | null>;
//# sourceMappingURL=index.d.ts.map