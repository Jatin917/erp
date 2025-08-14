export const permissions = {
    school: [
        "CREATE_SCHOOL",
        "VIEW_SCHOOL",
        "EDIT_SCHOOL",
        "DELETE_SCHOOL"
    ],
    branch: [
        "CREATE_BRANCH",
        "VIEW_BRANCH",
        "EDIT_BRANCH",
        "DELETE_BRANCH"
    ],
    class: [
        "CREATE_CLASS",
        "VIEW_CLASS",
        "EDIT_CLASS",
        "DELETE_CLASS"
    ],
    student: [
        "CREATE_STUDENT",
        "VIEW_STUDENT",
        "EDIT_STUDENT",
        "DELETE_STUDENT",
        "BULK_UPLOAD_STUDENTS"
    ],
    parent: [
        "CREATE_PARENT",
        "VIEW_PARENT",
        "EDIT_PARENT",
        "DELETE_PARENT"
    ],
    fees: [
        "CREATE_FEE_DOC",
        "VIEW_FEE_DOC",
        "EDIT_FEE_DOC",
        "DELETE_FEE_DOC",
        "RECORD_FEE_TRANSACTION",
        "VIEW_FEE_SUMMARY"
    ],
    session: [
        "CREATE_SESSION",
        "VIEW_SESSION",
        "EDIT_SESSION",
        "LOCK_SESSION",
        "PROMOTE_STUDENTS"
    ],
    reports: [
        "VIEW_REPORTS",
        "EXPORT_REPORTS"
    ],
    documents: [
        "GENERATE_ID_CARD",
        "GENERATE_TRANSFER_CERTIFICATE"
    ],
    notifications: [
        "SEND_NOTIFICATION",
        "VIEW_NOTIFICATIONS"
    ],
};
export const roleDefaults = {
    SUPERADMIN: [
        ...permissions.school,
        ...permissions.branch,
        ...permissions.class,
        ...permissions.student,
        ...permissions.parent,
        ...permissions.fees,
        ...permissions.session,
        ...permissions.reports,
        ...permissions.documents,
        ...permissions.notifications
    ],
    DIRECTOR: [
        ...permissions.school,
        ...permissions.branch,
        ...permissions.class,
        ...permissions.student,
        ...permissions.parent,
        ...permissions.fees,
        ...permissions.session,
        ...permissions.reports,
        ...permissions.documents,
        ...permissions.notifications
    ],
    PRINCIPAL: [
        ...permissions.branch,
        ...permissions.class,
        ...permissions.student,
        ...permissions.parent,
        ...permissions.fees,
        ...permissions.session,
        ...permissions.reports,
        ...permissions.documents,
        ...permissions.notifications
    ],
    TEACHER: [
        ...permissions.class,
        ...permissions.student,
        ...permissions.parent,
        "VIEW_REPORTS",
        "VIEW_NOTIFICATIONS"
    ],
    LIBRARIAN: [
        ...permissions.student,
        "VIEW_REPORTS",
        "VIEW_NOTIFICATIONS"
    ],
    RECEPTIONIST: [
        ...permissions.student,
        ...permissions.parent,
        "VIEW_REPORTS",
        "VIEW_NOTIFICATIONS"
    ],
    ACCOUNTANT: [
        ...permissions.fees,
        "VIEW_REPORTS",
        "VIEW_NOTIFICATIONS"
    ],
    SCHOOL_ADMIN: [
        ...permissions.branch,
        ...permissions.class,
        ...permissions.student,
        ...permissions.parent,
        ...permissions.fees,
        ...permissions.session,
        "VIEW_REPORTS",
        "VIEW_NOTIFICATIONS"
    ],
    STUDENT: [
        "VIEW_NOTIFICATIONS"
    ],
    PARENT: [
        "VIEW_NOTIFICATIONS"
    ],
};
//# sourceMappingURL=permission.js.map