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
export declare const removeDiscountFromFeeDoc: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
export declare const generateFeeDocsForStudents: (req: any, res: any) => Promise<any>;
export declare const generateFeeDocForStudent: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
export declare const getStudentFeeDocs: (req: any, res: any) => Promise<any>;
export declare const updateFeeDoc: (req: any, res: any) => Promise<any>;
export declare const addFeePayment: (req: any, res: any) => Promise<any>;
export declare const getFeePayments: (req: any, res: any) => Promise<any>;
export declare const updateFeePayment: (req: any, res: any) => Promise<any>;
export declare const getUnpaidFeePaymentAmount: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
/**
 * createTransaction:
 * - Validates input
 * - Finds due feePayments for the student ordered by dueDate (oldest first)
 * - Allocates payment amount sequentially to due payments (partial if needed)
 * - Creates a feeTransaction and feeTransactionItems atomically
 */
export declare const createTransaction: (req: any, res: any) => Promise<any>;
export declare const payForFeePayment: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
export declare const payForMultipleFeePayments: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
export declare const revertPaymentForFeePayment: (req: any, res: any) => Promise<import("express").Response<any, Record<string, any>>>;
//# sourceMappingURL=fees.d.ts.map