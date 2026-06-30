import type { Prisma } from "@prisma/client/extension";
import type { Role } from "../../../generated/prisma/index.js";
export declare const getUserService: (where: any, include?: any) => Promise<({
    [x: string]: ({
        classId: string;
        createdAt: Date;
        teacherId: string;
    } | {
        classId: string;
        createdAt: Date;
        teacherId: string;
    })[] | ({
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        name: string;
        branchId: string;
        createdAt: Date;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    } | {
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        name: string;
        branchId: string;
        createdAt: Date;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    })[] | ({
        id: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    } | {
        id: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    })[] | ({
        id: string;
        type: string;
        createdAt: Date;
        userId: string;
    } | {
        id: string;
        type: string;
        createdAt: Date;
        userId: string;
    })[] | ({
        id: string;
        name: string;
        createdAt: Date;
        createdById: string;
    } | {
        id: string;
        name: string;
        createdAt: Date;
        createdById: string;
    })[] | {
        classId: string;
        createdAt: Date;
        teacherId: string;
    }[] | {
        id: string;
        type: import("../../../generated/prisma/index.js").$Enums.customFieldType;
        name: string;
        branchId: string;
        createdAt: Date;
        options: import("../../../generated/prisma/runtime/library.js").JsonValue | null;
        entityType: import("../../../generated/prisma/index.js").$Enums.ENTITES;
        label: string;
        required: boolean;
        regex: string | null;
        minLength: number | null;
        maxLength: number | null;
        createdById: string;
    }[] | {
        id: string;
        remarks: string | null;
        mode: import("../../../generated/prisma/index.js").$Enums.PaymentMode;
        createdById: string;
        amountPaid: number;
        paidOn: Date;
        enrollmentId: string;
        receiptNo: string;
        referenceId: string | null;
        returnedAmt: number;
    }[] | {
        id: string;
        type: string;
        createdAt: Date;
        userId: string;
    }[] | {
        id: string;
        name: string;
        createdAt: Date;
        createdById: string;
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
export declare function findOrCreateUser({ name, email, phone, role, tx, }: {
    name: string;
    email: string;
    phone: string;
    role: Role;
    tx?: Prisma.TransactionClient;
}): Promise<any>;
//# sourceMappingURL=index.d.ts.map