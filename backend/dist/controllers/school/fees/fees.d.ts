import { FeePaymentType } from "../../../../generated/prisma/index.js";
export declare function generateDueDates(paymentType: FeePaymentType, options: {
    dueDate?: string | Date;
    installments?: number;
    months?: number;
    templateDueDate?: string;
}): Date[];
export declare const createFeeHead: (req: any, res: any) => Promise<any>;
export declare const listFeeHeads: (req: any, res: any) => Promise<any>;
export declare const updateFeeHead: (req: any, res: any) => Promise<any>;
export declare const deleteFeeHead: (req: any, res: any) => Promise<any>;
export declare const createFeeTemplate: (req: any, res: any) => Promise<any>;
export declare const getFeeTemplates: (req: any, res: any) => Promise<any>;
export declare const updateFeeTemplate: (req: any, res: any) => Promise<any>;
export declare const deleteFeeTemplate: (req: any, res: any) => Promise<any>;
export declare const generateFeeDocs: (req: any, res: any) => Promise<any>;
export declare const generateFeeDocForStudent: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
/**
 * createTransaction:
 * - Validates input
 * - Finds due feePayments for the student ordered by dueDate (oldest first)
 * - Allocates payment amount sequentially to due payments (partial if needed)
 * - Creates a feeTransaction and feeTransactionItems atomically
 */
//# sourceMappingURL=fees.d.ts.map