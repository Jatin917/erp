export declare function processFeePayment(tx: any, feePaymentId: string, amount: number, mode: string, referenceId: string | null, remarks: string | null, createdById: string): Promise<{
    txn: any;
    txnItem: any;
    updatedPayment: any;
    doc: any;
}>;
export declare const getStudentFeeDocs: (where: any, include: any) => Promise<({
    [x: string]: {
        id: string;
        createdAt: Date;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        appliedAmount: number;
        policyId: string | null;
    }[] | {
        reason: string | null;
        id: string;
        amount: number;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        paymentId: string | null;
    }[] | {
        name: string | null;
        id: string;
        createdAt: Date;
        amount: number;
        dueDate: Date;
        feeDocId: string;
        academicMonthId: string | null;
        isPaid: boolean;
        paidAmount: number;
        fineAmount: number;
    }[] | ({
        id: string;
        createdAt: Date;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        appliedAmount: number;
        policyId: string | null;
    } | {
        id: string;
        createdAt: Date;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        appliedAmount: number;
        policyId: string | null;
    })[] | ({
        id: string;
        transactionId: string;
        feeDocId: string;
        paidAmount: number;
    } | {
        id: string;
        transactionId: string;
        feeDocId: string;
        paidAmount: number;
    })[] | ({
        reason: string | null;
        id: string;
        amount: number;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        paymentId: string | null;
    } | {
        reason: string | null;
        id: string;
        amount: number;
        transactionId: string | null;
        feeDocId: string | null;
        feeTemplateId: string | null;
        paymentId: string | null;
    })[] | ({
        name: string | null;
        id: string;
        createdAt: Date;
        amount: number;
        dueDate: Date;
        feeDocId: string;
        academicMonthId: string | null;
        isPaid: boolean;
        paidAmount: number;
        fineAmount: number;
    } | {
        name: string | null;
        id: string;
        createdAt: Date;
        amount: number;
        dueDate: Date;
        feeDocId: string;
        academicMonthId: string | null;
        isPaid: boolean;
        paidAmount: number;
        fineAmount: number;
    })[] | {
        id: string;
        transactionId: string;
        feeDocId: string;
        paidAmount: number;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    createdAt: Date;
    amount: number;
    enrollmentId: string;
    status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    feeHeadId: string;
    paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
    templateId: string | null;
    afterAmount: number;
})[]>;
//# sourceMappingURL=index.d.ts.map