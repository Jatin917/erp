export declare const getUserService: (where: any, include?: any) => Promise<({
    [x: string]: ({
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    } | {
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    })[] | {
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        name: string;
        id: string;
        createdAt: Date;
        branchId: string;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    }[] | ({
        name: string;
        id: string;
        createdAt: Date;
        createdById: string;
    } | {
        name: string;
        id: string;
        createdAt: Date;
        createdById: string;
    })[] | ({
        createdAt: Date;
        classId: string;
        teacherId: string;
    } | {
        createdAt: Date;
        classId: string;
        teacherId: string;
    })[] | ({
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
    } | {
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
    })[] | ({
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
    })[] | ({
        id: string;
        createdAt: Date;
        remarks: string | null;
        lectureId: string;
        action: string;
        performedById: string;
    } | {
        id: string;
        createdAt: Date;
        remarks: string | null;
        lectureId: string;
        action: string;
        performedById: string;
    })[] | {
        name: string;
        id: string;
        createdAt: Date;
        createdById: string;
    }[] | {
        createdAt: Date;
        classId: string;
        teacherId: string;
    }[] | {
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
    }[] | {
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
    }[] | {
        id: string;
        createdAt: Date;
        remarks: string | null;
        lectureId: string;
        action: string;
        performedById: string;
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    role: import("../../../generated/prisma/index.js").$Enums.Role[];
    name: string;
    id: string;
    createdAt: Date;
    email: string;
    phone: string | null;
    password: string;
    permissions: import("../../../generated/prisma/index.js").$Enums.Permission[];
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
}) | null>;
//# sourceMappingURL=index.d.ts.map