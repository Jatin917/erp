import type { Prisma } from "@prisma/client/extension";
import type { Role } from "../../../generated/prisma/index.js";
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
        classId: string;
        teacherId: string;
        createdAt: Date;
    } | {
        classId: string;
        teacherId: string;
        createdAt: Date;
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
    })[] | ({
        type: import("../../../generated/prisma/index.js").$Enums.DocumentTemplateType;
        name: string;
        id: string;
        description: string | null;
        status: import("../../../generated/prisma/index.js").$Enums.TemplateStatus;
        createdAt: Date;
        branchId: string | null;
        createdById: string | null;
        pdfUrl: string;
        updatedAt: Date;
    } | {
        type: import("../../../generated/prisma/index.js").$Enums.DocumentTemplateType;
        name: string;
        id: string;
        description: string | null;
        status: import("../../../generated/prisma/index.js").$Enums.TemplateStatus;
        createdAt: Date;
        branchId: string | null;
        createdById: string | null;
        pdfUrl: string;
        updatedAt: Date;
    })[] | {
        name: string;
        id: string;
        createdAt: Date;
        createdById: string;
    }[] | {
        classId: string;
        teacherId: string;
        createdAt: Date;
    }[] | {
        type: string;
        id: string;
        createdAt: Date;
        userId: string;
    }[] | {
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
    }[] | {
        type: import("../../../generated/prisma/index.js").$Enums.DocumentTemplateType;
        name: string;
        id: string;
        description: string | null;
        status: import("../../../generated/prisma/index.js").$Enums.TemplateStatus;
        createdAt: Date;
        branchId: string | null;
        createdById: string | null;
        pdfUrl: string;
        updatedAt: Date;
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
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    permissions: import("../../../generated/prisma/index.js").$Enums.Permission[];
}) | null>;
export declare function findOrCreateUser({ name, email, phone, role, tx, }: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    tx?: Prisma.TransactionClient;
}): Promise<any>;
//# sourceMappingURL=index.d.ts.map