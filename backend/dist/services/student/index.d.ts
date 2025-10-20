export declare const getEnrollment: (where: any, include: any) => Promise<({
    [x: string]: ({
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        enrollmentId: string;
        amountPaid: number;
        returnedAmt: number;
        paidOn: Date;
        remarks: string | null;
        referenceId: string | null;
        receiptNo: string;
    } | {
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        enrollmentId: string;
        amountPaid: number;
        returnedAmt: number;
        paidOn: Date;
        remarks: string | null;
        referenceId: string | null;
        receiptNo: string;
    })[] | {
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        enrollmentId: string;
        amountPaid: number;
        returnedAmt: number;
        paidOn: Date;
        remarks: string | null;
        referenceId: string | null;
        receiptNo: string;
    }[] | ({
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        templateId: string | null;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        afterAmount: number;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    } | {
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        templateId: string | null;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        afterAmount: number;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    })[] | {
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        templateId: string | null;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        afterAmount: number;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    createdAt: Date;
    studentId: string;
    classId: string;
    sessionId: string;
    rollNo: string;
    isPromoted: boolean;
}) | null>;
//# sourceMappingURL=index.d.ts.map