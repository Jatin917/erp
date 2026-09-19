export declare const getEnrollment: (where: any, include: any) => Promise<({
    [x: string]: ({
        id: string;
        createdById: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    } | {
        id: string;
        createdById: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    })[] | {
        id: string;
        createdById: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    }[] | ({
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        enrollmentId: string;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    } | {
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        enrollmentId: string;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    })[] | ({
        id: string;
        createdAt: Date;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        enrollmentId: string;
        amount: number;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    } | {
        id: string;
        createdAt: Date;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        enrollmentId: string;
        amount: number;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    })[] | {
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        enrollmentId: string;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    }[] | {
        id: string;
        createdAt: Date;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        enrollmentId: string;
        amount: number;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    createdAt: Date;
    studentId: string;
    sessionId: string;
    classId: string;
    rollNo: string;
    isPromoted: boolean;
}) | null>;
//# sourceMappingURL=index.d.ts.map