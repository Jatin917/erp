export type Role =
  | "SUPERADMIN"
  | "DIRECTOR"
  | "PRINCIPAL"
  | "TEACHER"
  | "LIBRARIAN"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "SCHOOL_ADMIN"
  | "STUDENT"
  | "PARENT";

export type Permission =
  | "CREATE_SCHOOL"
  | "VIEW_SCHOOL"
  | "EDIT_SCHOOL"
  | "DELETE_SCHOOL"
  | "CREATE_BRANCH"
  | "VIEW_BRANCH"
  | "EDIT_BRANCH"
  | "DELETE_BRANCH"
  | "CREATE_CLASS"
  | "VIEW_CLASS"
  | "EDIT_CLASS"
  | "DELETE_CLASS"
  | "CREATE_STUDENT"
  | "VIEW_STUDENT"
  | "EDIT_STUDENT"
  | "DELETE_STUDENT"
  | "BULK_UPLOAD_STUDENTS"
  | "CREATE_PARENT"
  | "VIEW_PARENT"
  | "EDIT_PARENT"
  | "DELETE_PARENT"
  | "CREATE_FEE_DOC"
  | "VIEW_FEE_DOC"
  | "EDIT_FEE_DOC"
  | "DELETE_FEE_DOC"
  | "RECORD_FEE_TRANSACTION"
  | "VIEW_FEE_SUMMARY"
  | "CREATE_SESSION"
  | "VIEW_SESSION"
  | "EDIT_SESSION"
  | "LOCK_SESSION"
  | "PROMOTE_STUDENTS"
  | "VIEW_REPORTS"
  | "EXPORT_REPORTS"
  | "GENERATE_ID_CARD"
  | "GENERATE_TRANSFER_CERTIFICATE"
  | "SEND_NOTIFICATION"
  | "VIEW_NOTIFICATIONS";

export interface UserDTO {
  name: string;
  email: string;
  roles: Role[];            // note: plural to support teacher+parent
  permissions: Permission[]; 
  token?: string;
}
