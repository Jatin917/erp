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
        schoolDayId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        enrollmentId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    } | {
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        id: string;
        schoolDayId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        enrollmentId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    })[] | ({
        id: string;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    } | {
        id: string;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    })[] | {
        type: import("../../../generated/prisma/index.js").$Enums.AttendanceType;
        id: string;
        schoolDayId: string;
        status: import("../../../generated/prisma/index.js").$Enums.AttendanceStatus;
        enrollmentId: string;
        lectureId: string | null;
        method: import("../../../generated/prisma/index.js").$Enums.AttendanceMethod;
        markedById: string | null;
        markedAt: Date;
    }[] | {
        id: string;
        status: import("../../../generated/prisma/index.js").$Enums.PaymentStatus;
        createdAt: Date;
        amount: number;
        enrollmentId: string;
        feeHeadId: string;
        paymentType: import("../../../generated/prisma/index.js").$Enums.FeePaymentType;
        templateId: string | null;
        afterAmount: number;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    classId: string;
    sessionId: string;
    createdAt: Date;
    studentId: string;
    rollNo: string;
    isPromoted: boolean;
}) | null>;
//# sourceMappingURL=index.d.ts.map