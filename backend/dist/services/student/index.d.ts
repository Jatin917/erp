export declare const getEnrollment: (where: any, include: any) => Promise<({
    [x: string]: ({
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        remarks: string | null;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    } | {
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        remarks: string | null;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    })[] | {
        id: string;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        remarks: string | null;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    }[] | ({
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        id: string;
        enrollmentId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    } | {
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        id: string;
        enrollmentId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    })[] | ({
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    } | {
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
    })[] | {
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        id: string;
        enrollmentId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        schoolDayId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    }[] | {
        id: string;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
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