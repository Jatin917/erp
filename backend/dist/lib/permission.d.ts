import { $Enums } from "../../generated/prisma/index.js";
type PermissionKeys = 'school' | 'branch' | 'class' | 'section' | 'subject' | 'student' | 'parent' | 'faculty' | 'discounts' | 'feeHead' | 'feeTemplate' | 'feeDoc' | 'feePayment' | 'feeTransaction' | 'session' | 'reports' | 'documents' | 'notifications' | 'customField';
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
    STUDENT: ("VIEW_BRANCH" | "VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
    FATHER: ("VIEW_BRANCH" | "VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
    MOTHER: ("VIEW_BRANCH" | "VIEW_NOTIFICATIONS" | "VIEW_DOCUMENT")[];
};
export {};
//# sourceMappingURL=permission.d.ts.map