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


// types/student.ts
export interface StudentForm {
  id?: string;
  userId?: string | null;
  studentId?: string | null;

  branchId: string;
  rollNo: string;
  session:string;
  // Personal
  name: string;
  admissionNo?: string | null;
  class?: string | null; // ClassEnum
  section?: string | null;
  gender?: string | null;
  dob?: string | null;
  aadhaar?: string | null;
  birthCertificateUrl?: string | null;
  abcId?: string | null;
  sssmId?: string | null;
  familySssmId?: string | null;
  minority?: string | null;
  scStObc?: string | null;
  bpl?: string | null;
  scStObcCertificateUrl?: string | null;
  bplCertificateUrl?: string | null;
  specialChild?: boolean;
  allergies?: string | null;
  studentEmail?: string | null;
  studentMobile?: string | null;
  citizenship?: string | null;
  visaNo?: string | null;
  visaType?: string | null;
  visaValidity?: string | null;

  // Previous Education
  previousSchoolName?: string | null;
  previousClassPassed?: string | null;
  previousClassMarks?: string | null;
  previousClassYear?: string | null;
  previousBoard?: string | null;
  migrationCertificateUrl?: string | null;
  tcNo?: string | null;

  // Address
  permanentAddress?: string | null;
  temporaryAddress?: string | null;

  // Father
  fatherName?: string | null;
  fatherOccupation?: string | null;
  fatherEmail?: string | null;
  fatherMobile?: string | null;
  fatherAadhaar?: string | null;
  fatherIdUrl?: string | null;
  fatherPan?: string | null;
  fatherPassport?: string | null;
  fatherCitizenship?: string | null;
  fatherVisaNo?: string | null;
  fatherVisaType?: string | null;
  fatherVisaValidity?: string | null;

  // Mother
  motherName?: string | null;
  motherOccupation?: string | null;
  motherEmail?: string | null;
  motherMobile?: string | null;
  motherAadhaar?: string | null;
  motherIdUrl?: string | null;
  motherPan?: string | null;
  motherPassport?: string | null;
  motherCitizenship?: string | null;
  motherVisaNo?: string | null;
  motherVisaType?: string | null;
  motherVisaValidity?: string | null;

  // Fees
  discount: number;
  lateFine: number;
  remark?: string | null;

  currentYearTotal: number;
  currentYearTotalPaid: number;
  currentYearTotalBalance: number;

  lastYearTotal: number;
  lastYearTotalPaid: number;
  lastYearTotalBalance: number;

  // Extras
  result?: any;
  resultStatus?: string | null;
  photoUrl?: string | null;
  barcodeUrl?: string | null;
}


// src/constants/classOptions.ts

export type ClassType =
  | "NURSERY"
  | "LKG"
  | "UKG"
  | "FIRST"
  | "SECOND"
  | "THIRD"
  | "FOURTH"
  | "FIFTH"
  | "SIXTH"
  | "SEVENTH"
  | "EIGHTH"
  | "NINTH"
  | "TENTH"
  | "ELEVENTH"
  | "TWELFTH";

export const classOptions: { value: ClassType; label: string }[] = [
  { value: "NURSERY", label: "Nursery" },
  { value: "LKG", label: "LKG" },
  { value: "UKG", label: "UKG" },
  { value: "FIRST", label: "1st" },
  { value: "SECOND", label: "2nd" },
  { value: "THIRD", label: "3rd" },
  { value: "FOURTH", label: "4th" },
  { value: "FIFTH", label: "5th" },
  { value: "SIXTH", label: "6th" },
  { value: "SEVENTH", label: "7th" },
  { value: "EIGHTH", label: "8th" },
  { value: "NINTH", label: "9th" },
  { value: "TENTH", label: "10th" },
  { value: "ELEVENTH", label: "11th" },
  { value: "TWELFTH", label: "12th" },
];


export interface ContactInfo {
  existing: boolean;
  email: string;
  isVerifiedEmail: boolean;
  name: string;
  phone: string;
  isVerifiedPhone: boolean;
  assignMyself: boolean;
}