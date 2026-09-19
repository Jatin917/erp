import type { Prisma } from "@prisma/client/extension";
import type { Role } from "../../../generated/prisma/index.js";
export declare const getUserService: (where: any, include?: any) => Promise<({
    [x: string]: ({
        id: string;
        name: string;
        createdById: string;
        createdAt: Date;
    } | {
        id: string;
        name: string;
        createdById: string;
        createdAt: Date;
    })[] | ({
        id: string;
        name: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
    } | {
        id: string;
        name: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
    })[] | ({
        id: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        classLabelId: string | null;
        className: string;
        sectionId: string | null;
        fileName: string;
        filePath: string;
        status: import("../../../generated/prisma/index.js").$Enums.BulkUploadJobStatus;
        totalRows: number;
        successCount: number;
        failCount: number;
        errorMessage: string | null;
        startedAt: Date | null;
        finishedAt: Date | null;
    } | {
        id: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        classLabelId: string | null;
        className: string;
        sectionId: string | null;
        fileName: string;
        filePath: string;
        status: import("../../../generated/prisma/index.js").$Enums.BulkUploadJobStatus;
        totalRows: number;
        successCount: number;
        failCount: number;
        errorMessage: string | null;
        startedAt: Date | null;
        finishedAt: Date | null;
    })[] | ({
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
    } | {
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
    })[] | ({
        createdAt: Date;
        classId: string;
        teacherId: string;
    } | {
        createdAt: Date;
        classId: string;
        teacherId: string;
    })[] | ({
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
        name: string;
        createdById: string;
        createdAt: Date;
    }[] | {
        id: string;
        name: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
    }[] | {
        id: string;
        createdById: string;
        createdAt: Date;
        branchId: string;
        classLabelId: string | null;
        className: string;
        sectionId: string | null;
        fileName: string;
        filePath: string;
        status: import("../../../generated/prisma/index.js").$Enums.BulkUploadJobStatus;
        totalRows: number;
        successCount: number;
        failCount: number;
        errorMessage: string | null;
        startedAt: Date | null;
        finishedAt: Date | null;
    }[] | {
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
    }[] | {
        createdAt: Date;
        classId: string;
        teacherId: string;
    }[] | {
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
    }[];
    [x: number]: never;
    [x: symbol]: never;
} & {
    id: string;
    name: string;
    createdAt: Date;
    role: import("../../../generated/prisma/index.js").$Enums.Role[];
    email: string;
    phone: string | null;
    password: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    permissions: import("../../../generated/prisma/index.js").$Enums.Permission[];
}) | null>;
export declare function findOrCreateUser({ name, email, phone, role, tx, targetBranchId, }: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    tx?: Prisma.TransactionClient;
    targetBranchId?: string;
}): Promise<any>;
//# sourceMappingURL=index.d.ts.map