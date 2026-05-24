import { academicFields } from "./academic.fields.js";
import { attendanceFields } from "./attendance.fields.js";
import { computedFields } from "./computed.fields.js";
import { enrollmentFields } from "./enrollment.fields.js";
import { facultyFields } from "./faculty.fields.js";
import { feeFields } from "./fee.fields.js";
import { parentFields } from "./parent.fields.js";
import { studentFields } from "./student.fields.js";
export { studentFields } from "./student.fields.js";
export { enrollmentFields } from "./enrollment.fields.js";
export { academicFields } from "./academic.fields.js";
export { attendanceFields } from "./attendance.fields.js";
export { feeFields } from "./fee.fields.js";
export { parentFields } from "./parent.fields.js";
export { facultyFields } from "./faculty.fields.js";
export { computedFields } from "./computed.fields.js";
export const allFieldDefinitions = [
    ...studentFields,
    ...enrollmentFields,
    ...academicFields,
    ...attendanceFields,
    ...feeFields,
    ...parentFields,
    ...facultyFields,
    ...computedFields,
];
export const fieldDefinitionsByTable = {
    Student: studentFields,
    Enrollment: enrollmentFields,
    AcademicSession: academicFields.filter((f) => f.sourceTable === "AcademicSession"),
    ClassLabel: academicFields.filter((f) => f.sourceTable === "ClassLabel"),
    Section: academicFields.filter((f) => f.sourceTable === "Section"),
    Subject: academicFields.filter((f) => f.sourceTable === "Subject"),
    SchoolDay: academicFields.filter((f) => f.sourceTable === "SchoolDay"),
    Attendance: attendanceFields.filter((f) => f.sourceTable === "Attendance"),
    Lecture: [...attendanceFields.filter((f) => f.sourceTable === "Lecture"), ...facultyFields.filter((f) => f.sourceTable === "Lecture")],
    SchoolFacultyAttendance: attendanceFields.filter((f) => f.sourceTable === "SchoolFacultyAttendance"),
    FeeHead: feeFields.filter((f) => f.sourceTable === "FeeHead"),
    FeeDoc: feeFields.filter((f) => f.sourceTable === "FeeDoc"),
    FeePayment: feeFields.filter((f) => f.sourceTable === "FeePayment"),
    FeeTransaction: feeFields.filter((f) => f.sourceTable === "FeeTransaction"),
    DiscountPolicy: feeFields.filter((f) => f.sourceTable === "DiscountPolicy"),
    Discount: feeFields.filter((f) => f.sourceTable === "Discount"),
    Parent: parentFields,
    SchoolFaculty: facultyFields.filter((f) => f.sourceTable === "SchoolFaculty"),
};
//# sourceMappingURL=index.js.map