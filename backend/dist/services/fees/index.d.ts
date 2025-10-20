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
        feeDocId: string | null;
        transactionId: string | null;
        feeTemplateId: string | null;
        policyId: string | null;
        appliedAmount: number;
    }[] | {
        reason: string | null;
        id: string;
        amount: number;
        feeDocId: string | null;
        transactionId: string | null;
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
        fineAmount: number;
        paidAmount: number;
    }[] | ({
        id: string;
        createdAt: Date;
        feeDocId: string | null;
        transactionId: string | null;
        feeTemplateId: string | null;
        policyId: string | null;
        appliedAmount: number;
    } | {
        id: string;
        createdAt: Date;
        feeDocId: string | null;
        transactionId: string | null;
        feeTemplateId: string | null;
        policyId: string | null;
        appliedAmount: number;
    })[] | ({
        id: string;
        feeDocId: string;
        transactionId: string;
        paidAmount: number;
    } | {
        id: string;
        feeDocId: string;
        transactionId: string;
        paidAmount: number;
    })[] | ({
        reason: string | null;
        id: string;
        amount: number;
        feeDocId: string | null;
        transactionId: string | null;
        feeTemplateId: string | null;
        paymentId: string | null;
    } | {
        reason: string | null;
        id: string;
        amount: number;
        feeDocId: string | null;
        transactionId: string | null;
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
        fineAmount: number;
        paidAmount: number;
    } | {
        name: string | null;
        id: string;
        createdAt: Date;
        amount: number;
        dueDate: Date;
        feeDocId: string;
        academicMonthId: string | null;
        isPaid: boolean;
        fineAmount: number;
        paidAmount: number;
    })[] | {
        id: string;
        feeDocId: string;
        transactionId: string;
        paidAmount: number;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    createdAt: Date;
    amount: number;
    enrollmentId: string;
    templateId: string | null;
    feeHeadId: string;
    paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
    afterAmount: number;
    status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
})[]>;
//# sourceMappingURL=index.d.ts.map