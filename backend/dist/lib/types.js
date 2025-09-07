export var Permission;
(function (Permission) {
    // School
    Permission["CREATE_SCHOOL"] = "CREATE_SCHOOL";
    Permission["VIEW_SCHOOL"] = "VIEW_SCHOOL";
    Permission["EDIT_SCHOOL"] = "EDIT_SCHOOL";
    Permission["DELETE_SCHOOL"] = "DELETE_SCHOOL";
    // Branch
    Permission["CREATE_BRANCH"] = "CREATE_BRANCH";
    Permission["VIEW_BRANCH"] = "VIEW_BRANCH";
    Permission["EDIT_BRANCH"] = "EDIT_BRANCH";
    Permission["DELETE_BRANCH"] = "DELETE_BRANCH";
    // Class
    Permission["CREATE_CLASS"] = "CREATE_CLASS";
    Permission["VIEW_CLASS"] = "VIEW_CLASS";
    Permission["EDIT_CLASS"] = "EDIT_CLASS";
    Permission["DELETE_CLASS"] = "DELETE_CLASS";
    // Student
    Permission["CREATE_STUDENT"] = "CREATE_STUDENT";
    Permission["VIEW_STUDENT"] = "VIEW_STUDENT";
    Permission["EDIT_STUDENT"] = "EDIT_STUDENT";
    Permission["DELETE_STUDENT"] = "DELETE_STUDENT";
    Permission["BULK_UPLOAD_STUDENTS"] = "BULK_UPLOAD_STUDENTS";
    // Parent
    Permission["CREATE_PARENT"] = "CREATE_PARENT";
    Permission["VIEW_PARENT"] = "VIEW_PARENT";
    Permission["EDIT_PARENT"] = "EDIT_PARENT";
    Permission["DELETE_PARENT"] = "DELETE_PARENT";
    // Fees
    Permission["CREATE_FEE_DOC"] = "CREATE_FEE_DOC";
    Permission["VIEW_FEE_DOC"] = "VIEW_FEE_DOC";
    Permission["EDIT_FEE_DOC"] = "EDIT_FEE_DOC";
    Permission["DELETE_FEE_DOC"] = "DELETE_FEE_DOC";
    Permission["RECORD_FEE_TRANSACTION"] = "RECORD_FEE_TRANSACTION";
    Permission["VIEW_FEE_SUMMARY"] = "VIEW_FEE_SUMMARY";
    // Session
    Permission["CREATE_SESSION"] = "CREATE_SESSION";
    Permission["VIEW_SESSION"] = "VIEW_SESSION";
    Permission["EDIT_SESSION"] = "EDIT_SESSION";
    Permission["LOCK_SESSION"] = "LOCK_SESSION";
    Permission["PROMOTE_STUDENTS"] = "PROMOTE_STUDENTS";
    // Reports
    Permission["VIEW_REPORTS"] = "VIEW_REPORTS";
    Permission["EXPORT_REPORTS"] = "EXPORT_REPORTS";
    // Documents
    Permission["GENERATE_ID_CARD"] = "GENERATE_ID_CARD";
    Permission["GENERATE_TRANSFER_CERTIFICATE"] = "GENERATE_TRANSFER_CERTIFICATE";
    // Notifications
    Permission["SEND_NOTIFICATION"] = "SEND_NOTIFICATION";
    Permission["VIEW_NOTIFICATIONS"] = "VIEW_NOTIFICATIONS";
})(Permission || (Permission = {}));
export var OTP_TYPE;
(function (OTP_TYPE) {
    OTP_TYPE["SIGNIN_OTP"] = "SIGNIN_OTP";
    OTP_TYPE["VERIFY_OTP"] = "VERIFY_OTP";
})(OTP_TYPE || (OTP_TYPE = {}));
//# sourceMappingURL=types.js.map