import { $Enums } from "../../generated/prisma/index.js";
type PermissionKeys = 'school' | 'branch' | 'class' | 'student' | 'parent' | 'discounts' | 'feeHead' | 'feeTemplate' | 'feeDoc' | 'feePayment' | 'feeTransaction' | 'session' | 'reports' | 'documents' | 'notifications';
type PermissionsType = {
    [K in PermissionKeys]: $Enums.Permission[];
};
export declare const permissions: PermissionsType;
export declare const roleDefaults: {
    SUPERADMIN: $Enums.Permission[];
    DIRECTOR: $Enums.Permission[];
    PRINCIPAL: $Enums.Permission[];
    TEACHER: $Enums.Permission[];
    LIBRARIAN: $Enums.Permission[];
    RECEPTIONIST: $Enums.Permission[];
    ACCOUNTANT: $Enums.Permission[];
    SCHOOL_ADMIN: $Enums.Permission[];
    STUDENT: ("VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
    FATHER: ("VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
    MOTHER: ("VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
};
export {};
//# sourceMappingURL=permission.d.ts.map