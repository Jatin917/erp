// @ts-nocheck
import path, { dirname } from "path";
import fs from "fs";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { defaultPassword, LIMIT, prisma } from "../../../server.js"; // your prisma instance
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import XLSX from "xlsx";
import { ClassEnum } from "../../../../generated/prisma/index.js";
import { fileURLToPath } from "url";
import { connect } from "http2";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function getStudentDir(sid, bid, admissionNo) {
    // All must be string for path.join
    return path.join(__dirname, '..', "..", "..", "..", 'uploads', String(sid), String(bid), String(admissionNo));
}
// ----------------------
// Generate Barcode
// ----------------------
async function generateBarcode(student) {
    // Prepare the QR text
    const lastEnrollment = student.enrollments.at(-1);
    const sessionId = lastEnrollment ? lastEnrollment.sessionId : "";
    const qrText = `${student.id}|${student.branchId}|${student.name}|${student.rollNo}|${lastEnrollment?.id || ""}|${sessionId}`;
    // Define the folder where barcode will be saved
    // Example: backend/src/controllers/school/uploads/{schoolId}/{branchId}/{studentId}/
    const qrDir = getStudentDir(student.branch.schoolId, student.branchId, student.admissionNo);
    // Ensure the folder exists
    fs.mkdirSync(qrDir, { recursive: true });
    // Define full path for the barcode image
    const qrPath = path.join(qrDir, `${student.id}.png`);
    console.log("qrPath ", qrPath, qrText, student);
    // Generate and save the QR code image
    try {
        const buffer = await QRCode.toBuffer(qrText, { width: 350 });
        fs.writeFileSync(qrPath, buffer);
        console.log("QR code generated:", qrPath, buffer);
    }
    catch (err) {
        console.error("Failed to generate QR code:", err);
    }
    console.log("image is ");
    // Return relative path for frontend usage
    return path.join('..', "..", "..", "..", "uploads", student.branch.schoolId, student.branchId, student.admissionNo || student.id, `${student.id}.png`);
}
// ----------------------
// Create / Find User Helper
// ----------------------
async function findOrCreateUser(role, name, email, phone) {
    if (!email)
        return null;
    let user = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
    });
    if (user) {
        return prisma.user.update({
            where: { id: user.id },
            data: { name, email, phone, role: { push: role } },
        });
    }
    else {
        const hashedPwd = await bcrypt.hash(defaultPassword, 10);
        console.log("name is ", name);
        return prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPwd,
                role: [role],
                isEmailVerified: false,
                isPhoneVerified: false,
            },
        });
    }
}
async function createEnrollment(tx, // 👈 accept tx here
className, branchId, studentId, section, sessionId, rollNo) {
    // Ensure class exists (or create)
    let cls = await tx.class.findFirst({
        where: { name: className, section, branchId },
    });
    if (!cls) {
        cls = await tx.class.create({
            data: { name: className, section, branchId },
        });
    }
    // Create enrollment (if not already created, optional uniqueness check)
    const enrollment = await tx.enrollment.create({
        data: {
            studentId,
            classId: cls.id,
            sessionId,
            rollNo,
        },
    });
    return enrollment;
}
function normalizeSession(session) {
    // 1. Extract years (assume formats like "2024-2025", "2024-25", "24-25")
    const parts = session.split("-");
    if (parts.length !== 2)
        return session; // fallback if invalid format
    let start = parts[0].trim();
    let end = parts[1].trim();
    // If start is 2 digits (e.g. "24") → prefix with "20"
    if (start.length === 2)
        start = "20" + start;
    // If end is 2 digits (e.g. "25") → prefix with "20"
    if (end.length === 2)
        end = "20" + end;
    // If end is only 4 digits but not complete, we assume full
    return `${start}-${end}`;
}
function mapClassInput(input) {
    if (!input)
        return null;
    const trimmed = input.trim().toUpperCase();
    switch (trimmed) {
        case "NURSERY": return ClassEnum.NURSERY;
        case "LKG": return ClassEnum.LKG;
        case "UKG": return ClassEnum.UKG;
        case "I":
        case "FIRST": return ClassEnum.FIRST;
        case "II":
        case "SECOND": return ClassEnum.SECOND;
        case "III":
        case "THIRD": return ClassEnum.THIRD;
        case "IV":
        case "FOURTH": return ClassEnum.FOURTH;
        case "V":
        case "FIFTH": return ClassEnum.FIFTH;
        case "VI":
        case "SIXTH": return ClassEnum.SIXTH;
        case "VII":
        case "SEVENTH": return ClassEnum.SEVENTH;
        case "VIII":
        case "EIGHTH": return ClassEnum.EIGHTH;
        case "IX":
        case "NINTH": return ClassEnum.NINTH;
        case "X":
        case "TENTH": return ClassEnum.TENTH;
        case "XI":
        case "ELEVENTH": return ClassEnum.ELEVENTH;
        case "XII":
        case "TWELFTH": return ClassEnum.TWELFTH;
        default: return null; // invalid class input
    }
}
// ----------------------
// Main Create Student Function
// ----------------------
export const createStudent = async (req, res) => {
    try {
        let dataFromBody = req.body;
        const { session, class: classAsParam, branchId, rollNo, dob, ...data } = dataFromBody;
        const normalizedSession = normalizeSession(session);
        const student = await prisma.$transaction(async (tx) => {
            // ---------- 1. Check Academic Session ----------
            const sessionIsThere = await tx.academicSession.findFirst({
                where: { name: normalizedSession },
            });
            if (!sessionIsThere) {
                throw new Error("Academic Session does not exist");
            }
            // ---------- 2. Create Student User ----------
            const studentUser = await findOrCreateUser("STUDENT", data.name, data.studentEmail, data.studentMobile ? String(data.studentMobile) : null);
            // ---------- 3. Create Parent Users ----------
            let fatherParent = null;
            if (data.fatherName || data.fatherEmail || data.fatherMobile) {
                const fatherUser = await findOrCreateUser("FATHER", data.fatherName, data.fatherEmail, data.fatherMobile ? String(data.fatherMobile) : null);
                if (fatherUser) {
                    fatherParent = await tx.parent.create({
                        data: { type: "FATHER", userId: String(fatherUser.id) },
                    });
                }
            }
            let motherParent = null;
            if (data.motherName || data.motherEmail || data.motherMobile) {
                const motherUser = await findOrCreateUser("MOTHER", data.motherName, data.motherEmail, data.motherMobile ? String(data.motherMobile) : null);
                if (motherUser) {
                    motherParent = await tx.parent.create({
                        data: { type: "MOTHER", userId: String(motherUser.id) },
                    });
                }
            }
            // ---------- 4. Create Student Record ----------
            console.log("dob ", dob);
            const student = await tx.student.create({
                data: {
                    // ---------- Keep connect relations ----------
                    user: studentUser ? { connect: { id: String(studentUser.id) } } : undefined,
                    father: fatherParent ? { connect: { id: String(fatherParent.id) } } : undefined,
                    mother: motherParent ? { connect: { id: String(motherParent.id) } } : undefined,
                    branch: { connect: { id: branchId } },
                    rollNo,
                    class: classAsParam,
                    // ---------- Map fields from data ----------
                    name: String(data.name),
                    studentId: data.studentId || null,
                    admissionNo: data.admissionNo || null,
                    section: data.section || null,
                    gender: data.gender || null,
                    dob: dob ? new Date(dob) : null,
                    aadhaar: data.aadhaar || null,
                    birthCertificateUrl: data.birthCertificateUrl || null,
                    abcId: data.abcId || null,
                    sssmId: data.sssmId || null,
                    familySssmId: data.familySssmId || null,
                    minority: data.minority || null,
                    scStObc: data.scStObc || null,
                    bpl: data.bpl || null,
                    scStObcCertificateUrl: data.scStObcCertificateUrl || null,
                    bplCertificateUrl: data.bplCertificateUrl || null,
                    specialChild: data.specialChild ? Boolean(data.specialChild) : false,
                    allergies: data.allergies || null,
                    studentEmail: data.studentEmail || null,
                    studentMobile: data.studentMobile || null,
                    citizenship: data.citizenship || null,
                    visaNo: data.visaNo || null,
                    visaType: data.visaType || null,
                    visaValidity: data.visaValidity ? new Date(data.visaValidity) : null,
                    // Father / Mother details
                    fatherName: data.fatherName || null,
                    fatherOccupation: data.fatherOccupation || null,
                    fatherEmail: data.fatherEmail || null,
                    fatherMobile: data.fatherMobile || null,
                    fatherAadhaar: data.fatherAadhaar || null,
                    fatherIdUrl: data.fatherIdUrl || null,
                    fatherPan: data.fatherPan || null,
                    fatherPassport: data.fatherPassport || null,
                    fatherCitizenship: data.fatherCitizenship || null,
                    fatherVisaNo: data.fatherVisaNo || null,
                    fatherVisaType: data.fatherVisaType || null,
                    fatherVisaValidity: data.fatherVisaValidity ? new Date(data.fatherVisaValidity) : null,
                    motherName: data.motherName || null,
                    motherOccupation: data.motherOccupation || null,
                    motherEmail: data.motherEmail || null,
                    motherMobile: data.motherMobile || null,
                    motherAadhaar: data.motherAadhaar || null,
                    motherIdUrl: data.motherIdUrl || null,
                    motherPan: data.motherPan || null,
                    motherPassport: data.motherPassport || null,
                    motherCitizenship: data.motherCitizenship || null,
                    motherVisaNo: data.motherVisaNo || null,
                    motherVisaType: data.motherVisaType || null,
                    motherVisaValidity: data.motherVisaValidity ? new Date(data.motherVisaValidity) : null,
                    // Fees
                    discount: data.discount ? parseFloat(data.discount) : 0,
                    lateFine: data.lateFine ? parseFloat(data.lateFine) : 0,
                    remark: data.remark || null,
                    currentYearTotal: data.currentYearTotal ? parseFloat(data.currentYearTotal) : 0,
                    currentYearTotalPaid: data.currentYearTotalPaid ? parseFloat(data.currentYearTotalPaid) : 0,
                    currentYearTotalBalance: data.currentYearTotalBalance ? parseFloat(data.currentYearTotalBalance) : 0,
                    lastYearTotal: data.lastYearTotal ? parseFloat(data.lastYearTotal) : 0,
                    lastYearTotalPaid: data.lastYearTotalPaid ? parseFloat(data.lastYearTotalPaid) : 0,
                    lastYearTotalBalance: data.lastYearTotalBalance ? parseFloat(data.lastYearTotalBalance) : 0,
                    // Previous education & address
                    previousSchoolName: data.previousSchoolName || null,
                    previousClassPassed: data.previousClassPassed || null,
                    previousClassMarks: data.previousClassMarks || null,
                    previousClassYear: data.previousClassYear || null,
                    previousBoard: data.previousBoard || null,
                    migrationCertificateUrl: data.migrationCertificateUrl || null,
                    tcNo: data.tcNo || null,
                    permanentAddress: data.permanentAddress || null,
                    temporaryAddress: data.temporaryAddress || null,
                    // Extras
                    result: data.result || null,
                    resultStatus: data.resultStatus || null,
                    photoUrl: data.photoUrl || null,
                    barcodeUrl: data.barcodeUrl || null,
                },
                include: { user: true, enrollments: true, branch: true },
            });
            // ---------- 5. Enrollment ----------
            const classValue = mapClassInput(classAsParam);
            if (!classValue)
                throw new Error(`Invalid class: ${classAsParam}`);
            await createEnrollment(tx, classValue, String(branchId), String(student.id), data.section ? String(data.section) : null, String(sessionIsThere.id), rollNo ? String(rollNo) : null);
            // ---------- 6. Barcode ----------
            const barcodeUrl = await generateBarcode(student);
            await tx.student.update({
                where: { id: String(student.id) },
                data: { barcodeUrl },
            });
            // ---------- 7. Current Year Fee ----------
            let tuitionFee = data.currentYearTuitionFee
                ? parseFloat(String(data.currentYearTuitionFee))
                : 0;
            let admissionFee = data.currentYearAdmissionFee
                ? parseFloat(String(data.currentYearAdmissionFee))
                : 0;
            if (!tuitionFee && !admissionFee) {
                tuitionFee = data.currentYearTotal ? parseFloat(String(data.currentYearTotal)) : 0;
            }
            const currentFeeDoc = await tx.feeDoc.create({
                data: {
                    student: { connect: { id: String(student.id) } },
                    session: { connect: { id: String(sessionIsThere.id) } },
                    admissionFee,
                    tuitionFee,
                    totalPayable: admissionFee + tuitionFee,
                    paidInSession: data.currentYearTotalPaid
                        ? parseFloat(String(data.currentYearTotalPaid))
                        : 0,
                    dueInSession: admissionFee + tuitionFee - (data.currentYearTotalPaid
                        ? parseFloat(String(data.currentYearTotalPaid))
                        : 0),
                },
            });
            // ---------- 8. Last Year Fee (optional) ----------
            if (data.lastYearAdmissionFee || data.lastYearTuitionFee || data.lastYearTotal) {
                const lastSession = await tx.academicSession.findFirst({
                    where: { branchId: String(branchId), isCurrent: false },
                    orderBy: { createdAt: "desc" },
                });
                if (lastSession) {
                    await tx.feeDoc.create({
                        data: {
                            student: { connect: { id: String(student.id) } },
                            session: { connect: { id: String(lastSession.id) } },
                            admissionFee: data.lastYearAdmissionFee
                                ? parseFloat(String(data.lastYearAdmissionFee))
                                : 0,
                            tuitionFee: data.lastYearTuitionFee
                                ? parseFloat(String(data.lastYearTuitionFee))
                                : data.lastYearTotal
                                    ? parseFloat(String(data.lastYearTotal))
                                    : 0,
                            totalPayable: (data.lastYearAdmissionFee
                                ? parseFloat(String(data.lastYearAdmissionFee))
                                : 0) +
                                (data.lastYearTuitionFee
                                    ? parseFloat(String(data.lastYearTuitionFee))
                                    : data.lastYearTotal
                                        ? parseFloat(String(data.lastYearTotal))
                                        : 0),
                            paidInSession: data.lastYearTotalPaid
                                ? parseFloat(String(data.lastYearTotalPaid))
                                : 0,
                            dueInSession: data.lastYearTotalBalance
                                ? parseFloat(String(data.lastYearTotalBalance))
                                : 0,
                        },
                    });
                }
                else {
                    await tx.feeDoc.update({
                        where: { id: currentFeeDoc.id },
                        data: {
                            tuitionFee: {
                                increment: data.lastYearTotal
                                    ? parseFloat(String(data.lastYearTotal))
                                    : 0,
                            },
                            totalPayable: {
                                increment: data.lastYearTotal
                                    ? parseFloat(String(data.lastYearTotal))
                                    : 0,
                            },
                            paidInSession: {
                                increment: data.lastYearTotalPaid
                                    ? parseFloat(String(data.lastYearTotalPaid))
                                    : 0,
                            },
                            dueInSession: {
                                increment: data.lastYearTotalBalance
                                    ? parseFloat(String(data.lastYearTotalBalance))
                                    : 0,
                            },
                        },
                    });
                }
            }
            return student;
        });
        return res.status(201).json({
            success: true,
            message: "Student created successfully",
            studentId: student.id,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const bulkUploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ success: false, message: "No file uploaded" });
        }
        const { branchId } = req.body;
        const filePath = req.file.path; // multer stores file temporarily
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        let results = [];
        for (const row of sheetData) {
            try {
                const session = row.session;
                const classAsParam = row.class;
                const normalizedSession = normalizeSession(session);
                const student = await prisma.$transaction(async (tx) => {
                    const sessionIsThere = await tx.academicSession.findFirst({
                        where: { name: normalizedSession },
                    });
                    if (!sessionIsThere) {
                        throw new Error("Academic Session does not exist");
                    }
                    // 1. Student User
                    const studentUser = await findOrCreateUser("STUDENT", row.studentName, row.studentEmail, row.studentMobile ? String(row.studentMobile) : null);
                    // skipping this part student email and mobile are not always available
                    // if (!studentUser) throw new Error("Student user creation failed");
                    // 2. Father (if any)
                    let fatherParent = null;
                    if (row.fatherName || row.fatherEmail || row.fatherMobile) {
                        const fatherUser = await findOrCreateUser("FATHER", row.fatherName, row.fatherEmail, row.fatherMobile ? String(row.fatherMobile) : null);
                        if (fatherUser) {
                            fatherParent = await tx.parent.create({
                                data: { type: "FATHER", userId: fatherUser.id },
                            });
                        }
                    }
                    // 3. Mother (if any)
                    let motherParent = null;
                    if (row.motherName || row.motherEmail || row.motherMobile) {
                        const motherUser = await findOrCreateUser("MOTHER", row.motherName, row.motherEmail, row.motherMobile ? String(row.motherMobile) : null);
                        if (motherUser) {
                            motherParent = await tx.parent.create({
                                data: { type: "MOTHER", userId: motherUser.id },
                            });
                        }
                    }
                    // 4. Student record
                    const student = await tx.student.create({
                        data: {
                            name: row.studentName,
                            user: studentUser
                                ? { connect: { id: String(studentUser.id) } }
                                : undefined,
                            branch: {
                                connect: { id: branchId } // keep as is
                            },
                            admissionNo: row.AdmissionNo ? String(row.AdmissionNo) : null,
                            rollNo: row.rollNo ? String(row.rollNo) : null,
                            studentId: row.studentId ? String(row.studentId) : null,
                            studentEmail: row.studentEmail ? String(row.studentEmail) : null,
                            studentMobile: row.studentMobile ? String(row.studentMobile) : null,
                            fatherName: row.fatherName ? String(row.fatherName) : null,
                            fatherEmail: row.fatherEmail ? String(row.fatherEmail) : null,
                            fatherMobile: row.fatherMobile ? String(row.fatherMobile) : null,
                            motherName: row.motherName ? String(row.motherName) : null,
                            motherEmail: row.motherEmail ? String(row.motherEmail) : null,
                            motherMobile: row.motherMobile ? String(row.motherMobile) : null,
                            lastYearTotal: row.lastYearTotal ? parseFloat(row.lastYearTotal) : 0,
                            lastYearTotalBalance: row.lastYearTotalBalance ? parseFloat(row.lastYearTotalBalance) : 0,
                            lastYearTotalPaid: row.lastYearTotalPaid ? parseFloat(row.lastYearTotalPaid) : 0,
                            currentYearTotal: row.currentYearTotal ? parseFloat(row.currentYearTotal) : 0,
                            currentYearTotalPaid: row.currentYearTotalPaid ? parseFloat(row.currentYearTotalPaid) : 0,
                            currentYearTotalBalance: row.currentYearTotalBalance ? parseFloat(row.currentYearTotalBalance) : 0,
                            father: fatherParent
                                ? { connect: { id: String(fatherParent.id) } }
                                : undefined,
                            mother: motherParent
                                ? { connect: { id: String(motherParent.id) } }
                                : undefined,
                        },
                        include: { user: true, enrollments: true, branch: true },
                    });
                    // ---------- 5. Enrollment ----------
                    const classValue = mapClassInput(classAsParam);
                    if (!classValue)
                        throw new Error(`Invalid class: ${classAsParam}`);
                    await createEnrollment(tx, classValue, branchId, student.id, row.section, sessionIsThere.id, row.rollNo ? String(row.rollNo) : null);
                    const sessionId = sessionIsThere.id;
                    // 5. Barcode
                    const barcodeUrl = await generateBarcode(student);
                    await tx.student.update({
                        where: { id: student.id },
                        data: { barcodeUrl },
                    });
                    // 6. Current year fees
                    // ---------- Current Year Fees ----------
                    let tuitionFee = 0;
                    let admissionFee = 0;
                    if (!row.currentYearAdmissionFee && !row.currentYearTuitionFee) {
                        tuitionFee = parseFloat(row.currentYearTotal || "0");
                    }
                    else {
                        tuitionFee = parseFloat(row.currentYearTuitionFee || "0");
                        admissionFee = parseFloat(row.currentYearAdmissionFee || "0");
                    }
                    const currentFeeDoc = await tx.feeDoc.create({
                        data: {
                            student: { connect: { id: student.id } }, // use relation
                            session: { connect: { id: sessionId } },
                            admissionFee,
                            tuitionFee,
                            totalPayable: admissionFee + tuitionFee,
                            dueInSession: admissionFee + tuitionFee - parseFloat(row.currentYearTotalPaid || "0"),
                        },
                    });
                    // ---------- Last Year Fees (optional) ----------
                    if (row.lastYearAdmissionFee || row.lastYearTuitionFee || row.lastYearTotal) {
                        const lastSession = await tx.academicSession.findFirst({
                            where: { branchId: row.branchId, isCurrent: false },
                            orderBy: { createdAt: "desc" },
                        });
                        if (lastSession) {
                            await tx.feeDoc.create({
                                data: {
                                    student: { connect: { id: student.id } },
                                    session: { connect: { id: sessionId } },
                                    // sessionId: lastSession.id,
                                    admissionFee: parseFloat(row.lastYearAdmissionFee || "0"),
                                    tuitionFee: parseFloat(row.lastYearTuitionFee || row.lastYearTotal || "0"),
                                    totalPayable: parseFloat(row.lastYearAdmissionFee || "0") + parseFloat(row.lastYearTuitionFee || row.lastYearTotal || "0"),
                                    dueInSession: parseFloat(row.lastYearTotalBalance || "0"),
                                },
                            });
                        }
                        else {
                            await tx.feeDoc.update({
                                where: { id: currentFeeDoc.id },
                                data: {
                                    tuitionFee: { increment: parseFloat(row.lastYearTotal || "0") },
                                    totalPayable: { increment: parseFloat(row.lastYearTotal || "0") },
                                    paidInSession: { increment: parseFloat(row.lastYearTotalPaid || "0") },
                                    dueInSession: { increment: parseFloat(row.lastYearTotalBalance || "0") },
                                },
                            });
                        }
                    }
                    return student;
                });
                results.push({ studentId: student.id, success: true });
            }
            catch (err) {
                results.push({ error: err.message, success: false });
            }
        }
        return res.status(201).json({
            success: true,
            message: "Bulk upload completed",
            results,
        });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: error.message });
    }
};
export const fetchStudents = async (req, res) => {
    try {
        let { createdBy, task, page, studentId, class: className, section, session, name, admissionNo, rollNo, fatherName, mobile, ...filters } = req.query;
        if (studentId)
            filters.id = studentId;
        // Pagination
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(LIMIT, 10) || 10;
        // 🔹 Base student filters
        const whereClause = {
            ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, String(value)])),
            ...(name && {
                name: { startsWith: name, mode: "insensitive" },
            }),
            ...(admissionNo && {
                admissionNo: { startsWith: admissionNo, mode: "insensitive" },
            }),
            ...(fatherName && {
                fatherName: { startsWith: fatherName, mode: "insensitive" },
            }),
            ...(mobile && {
                fatherMobile: { startsWith: mobile, mode: "insensitive" },
            }),
        };
        // 🔹 Enrollment filters
        const enrollmentWhere = {};
        if (session) {
            enrollmentWhere.session = { name: session };
        }
        if (className) {
            enrollmentWhere.class = { name: className };
        }
        if (section) {
            enrollmentWhere.class = { section: { name: section } };
        }
        if (rollNo) {
            enrollmentWhere.rollNo = { startsWith: rollNo, mode: "insensitive" };
        }
        // 🔹 Fetch students
        let studentsRaw;
        if (pageNumber === -1) {
            // Fetch all
            studentsRaw = await prisma.student.findMany({
                where: {
                    ...whereClause,
                    ...(Object.keys(enrollmentWhere).length > 0 && {
                        enrollments: { some: enrollmentWhere },
                    }),
                },
                orderBy: { createdAt: "desc" },
                include: {
                    enrollments: {
                        where: Object.keys(enrollmentWhere).length ? enrollmentWhere : undefined,
                        orderBy: { createdAt: "desc" },
                        include: {
                            class: { include: { section: true } },
                        },
                    },
                },
            });
        }
        else {
            // Paginated fetch
            studentsRaw = await prisma.student.findMany({
                where: {
                    ...whereClause,
                    ...(Object.keys(enrollmentWhere).length > 0 && {
                        enrollments: { some: enrollmentWhere },
                    }),
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: "desc" },
                include: {
                    enrollments: {
                        where: Object.keys(enrollmentWhere).length ? enrollmentWhere : undefined,
                        orderBy: { createdAt: "desc" },
                        take: 1,
                        include: {
                            class: { include: { section: true } },
                        },
                    },
                },
            });
        }
        // 🔹 Transform result
        const students = studentsRaw.map((student) => {
            const latest = student.enrollments[0];
            return {
                id: student.id,
                name: student.name,
                email: student.email,
                mobile: student.fatherMobile,
                admissionNo: student.admissionNo,
                section: latest?.class?.section?.name || null,
                barcodeUrl: student.barcodeUrl,
                rollNo: latest?.rollNo || null,
                classLabel: latest?.class?.name || null,
                fatherName: student.fatherName,
                dob: student.dob,
                gender: student.gender,
                category: student.category,
            };
        });
        // 🔹 Count
        const total = pageNumber === -1
            ? students.length
            : await prisma.student.count({
                where: {
                    ...whereClause,
                    ...(Object.keys(enrollmentWhere).length > 0 && {
                        enrollments: { some: enrollmentWhere },
                    }),
                },
            });
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                students,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: pageNumber === -1 ? total : pageSize,
                    totalPages: pageNumber === -1 ? 1 : Math.ceil(total / pageSize),
                },
            },
        });
    }
    catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).json({ error: "Failed to fetch students" });
    }
};
export const getStudentDetail = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Student ID is required",
            });
        }
        const student = await prisma.student.findUnique({
            where: { id },
            include: {
                enrollments: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        class: {
                            include: {
                                section: { select: { name: true } },
                                branch: { select: { id: true, name: true } },
                            }
                        },
                        session: true,
                    },
                },
            },
        });
        if (!student) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: "Student not found",
            });
        }
        // latest enrollment
        const latestEnrollment = student.enrollments[0];
        console.log("student details ", latestEnrollment);
        const result = {
            id: student.id,
            name: student.name,
            admissionNo: student.admissionNo,
            rollNo: latestEnrollment?.rollNo || null,
            email: student.email,
            mobile: student.fatherMobile,
            fatherName: student.fatherName,
            dob: student.dob,
            gender: student.gender,
            category: student.category,
            barcodeUrl: student.barcodeUrl,
            // Class & section
            classLabel: latestEnrollment?.class?.name || null,
            section: latestEnrollment?.class?.section?.name || null,
            branch: latestEnrollment?.class?.branch || null,
            session: latestEnrollment?.session?.name || null,
            // Fees summary
            totalFeesPaid: student.currentYearTotalPaid + student.lastYearTotalPaid,
            totalPayable: student.currentYearTotal + student.lastYearTotal,
            totalBalanceRemaining: student.currentYearTotalBalance + student.lastYearTotalBalance,
        };
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            data: result,
        });
    }
    catch (err) {
        console.error("Error fetching student detail:", err);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to fetch student details",
        });
    }
};
export const downloadSampleSheetForBulkUpload = (req, res) => {
    try {
        const filePath = path.join(__dirname, "../../../../uploads/sample-sheets/sample.xlsx");
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "File not found",
                data: null,
            });
        }
        // Read file as base64
        const fileBuffer = fs.readFileSync(filePath);
        const fileBase64 = fileBuffer.toString("base64");
        return res.status(200).json({
            success: true,
            message: "Sample sheet downloaded successfully",
            data: {
                fileName: "SampleSheet.xlsx",
                mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileContent: fileBase64,
            },
        });
    }
    catch (error) {
        console.error("Server error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null,
        });
    }
};
// // ----------- UPDATE STUDENT -----------
// router.put('/:id', async (req, res) => {
//   const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(student);
// });
// // ----------- DELETE STUDENT -----------
// router.delete('/:id', async (req, res) => {
//   await Student.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });
// // Excel Upload
// router.post('/upload', async (req, res) => {
//   console.log('UPLOAD ROUTE HIT!');
//   console.log('REQ QUERY:', req.query);
//   console.log('REQ BODY:', req.body);
//   console.log('REQ FILES:', req.files);
//   const sid = String(req.query.sid || '').trim();
//   const bid = String(req.query.bid || '').trim();
//   if (!req.files || !req.files.file){
//     console.log('NO FILE UPLOADED!');
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   console.log('GOT FILE:', req.files.file.name, req.files.file.size);
//   const workbook = XLSX.read(req.files.file.data, { type: 'buffer' });
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   const data = XLSX.utils.sheet_to_json(sheet);
//   for (const row of data) {
//     // defensive approach to set section of students which don't have section
//     if(!row['section']) row['section'] = "A";
//     console.log('ROW:', row);
//     const {totalLastYearFees, totalLastYearPaid, totalLastRemainingBalance, totalCurrentYearFees, totalCurrentYearPaid, totalCurrentYearRemaningBalance, totalOfLastAndCurrent, ...cleanedRow} =row;
//     const totalBalancePayable = parseparseFloat(totalLastRemainingBalance) || 0 + parseparseFloat(totalCurrentYearRemaningBalance) || 0;
//     const totalPayableYearly = parseparseFloat(totalCurrentYearPaid) || 0;
//     const session = row['Academic Session'] || row['session'] || row['Session'];
//     // Defensive with AdmissionNo header
//     const admissionNo = String(row.AdmissionNo || row['AdmissionNo'] || row['Admission No'] || row['admissionNo'] || '').trim();
//     if (!admissionNo) continue; // AdmissionNo is required
//     console.log("sid, bid, session ", sid, bid, session);
//     // Defensive: Do not continue if sid, bid, or session missing
//     if (!sid || !bid || !session) continue;
//     // Upsert (update if exists, else insert)
//     const student = await Student.findOneAndUpdate(
//       { admissionNo, session, sid, bid },
//       { ...cleanedRow, sid, bid, session, admissionNo, totalPayableYearly, totalBalancePayable, totalLastYearFees, totalLastYearPaid, totalLastRemainingBalance },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );
//     console.log("detail of uploaded data ", student);
//     // Ensure folder structure is created
//     const studentDir = getStudentDir(String(sid), String(bid), String(admissionNo));
//     fs.mkdirSync(studentDir, { recursive: true });
//     // Always generate barcode (or check for changes if you wish)
//     const barcodeUrl = await generateBarcode(student);
//     student.barcodeUrl = barcodeUrl;
//     await student.save();
//     // User logins creation
//     // Only create if both email and mobile are provided and not empty/undefined
//     if(student.studentEmail || student.studentMobile) {
//       let user = await User.findOne({ email: student.studentEmail, mobile: student.studentMobile, sid, bid, usertype: 'Student' });
//       if (user) {
//         user.name = student.studentName;
//         user.mobile = student.studentMobile;
//         user.email = student.studentEmail;
//         await user.save();
//       } else {
//         const rawPwd = '1234';
//         await User.create({
//           name: student.studentName,
//           email: student.studentEmail,
//           mobile: student.studentMobile,
//           sid,
//           bid,
//           usertype: 'Student',
//           password: rawPwd,
//           status: 'Active'
//         });
//       }
//     }
//     if(student.fatherEmail || student.fatherMobile) {
//       let userFather = await User.findOne({ email: student.fatherEmail, mobile: student.fatherMobile, sid, bid, usertype: 'Parent' });
//       if (userFather) {
//         userFather.name = student.fatherName;
//         userFather.mobile = student.fatherMobile;
//         userFather.email = student.fatherEmail;
//         await userFather.save();
//       } else {
//         const rawPwd = '1234';
//         console.log("creating father id");
//         await User.create({
//           name: student.fatherName,
//           email: student.fatherEmail,
//           mobile: student.fatherMobile,
//           sid,
//           bid,
//           usertype: 'Parent',
//           password: rawPwd,
//           status: 'Active'
//         });
//         console.log("creating father id ", );
//       }
//     }
//     if(student.motherEmail || student.motherMobile) {
//       let userMother = await User.findOne({ email: student.motherEmail, mobile: student.motherMobile, sid, bid, usertype: 'Parent' });
//       if (userMother) {
//         userMother.name = student.motherName;
//         userMother.mobile = student.motherMobile;
//         userMother.email = student.motherEmail;
//         await userMother.save();
//       } else {
//         const rawPwd = '1234';
//         await User.create({
//           name: student.motherName,
//           email: student.motherEmail,
//           mobile: student.motherMobile,
//           sid,
//           bid,
//           usertype: 'Parent',
//           password: rawPwd,
//           status: 'Active'
//         });
//       }
//     }
//     // END LOGIN CREATION
//   } // end for each row
//   res.json({ success: true });
// });
// // Excel Download by session
// router.get('/download', async (req, res) => {
//   const { session, sid, bid } = req.query;
//   const students = await Student.find({ sid, bid, session });
//   const data = students.map(s => s.toObject());
//   const worksheet = XLSX.utils.json_to_sheet(data);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
//   const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
//   res.set('Content-Disposition', 'attachment; filename="students.xlsx"');
//   res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//   res.send(buf);
// });
// // Class Promotion
// router.post('/promote', async (req, res) => {
//   const { sessionFrom, sessionTo, sid, bid, studentIds } = req.body;
//   const classMap = {
//     'Nursery': 'LKG', 'LKG':'UKG', 'UKG': 'I', 'I': 'II', 'II': 'III', 'III': 'IV', 'IV': 'V', 'V': 'VI',
//     'VI': 'VII', 'VII': 'VIII', 'VIII': 'IX', 'IX': 'X', 'X': 'XI', 'XI': 'XII'
//   };
//   const students = await Student.find({ _id: { $in: studentIds }, resultStatus: 'Pass', session: sessionFrom, sid, bid });
//   for (const student of students) {
//     const newClass = classMap[student.class] || student.class;
//     const promoted = { ...student.toObject(), class: newClass, session: sessionTo, _id: undefined };
//     const newStu = await Student.create(promoted);
//     // Ensure folder structure and barcode for promoted student
//     const studentDir = getStudentDir(sid, bid, newStu.admissionNo);
//     fs.mkdirSync(studentDir, { recursive: true });
//     const barcodeUrl = await generateBarcode(newStu);
//     newStu.barcodeUrl = barcodeUrl;
//     await newStu.save();
//   }
//   res.json({ success: true });
// });
// // Upload student photo
// router.post('/upload-photo/:id', async (req, res) => {
//   try {
//     if (!req.files || !req.files.photo) return res.status(400).json({ error: 'No photo file uploaded.' });
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ error: 'Student not found' });
//     const studentDir = getStudentDir(student.sid, student.bid, student.admissionNo);
//     fs.mkdirSync(studentDir, { recursive: true });
//     const ext = path.extname(req.files.photo.name);
//     const photoName = 'photo' + ext;
//     const photoPath = path.join(studentDir, photoName);
//     await req.files.photo.mv(photoPath);
//     student.photoUrl = `uploads/${student.sid}/${student.bid}/${student.admissionNo}/${photoName}`;
//     await student.save();
//     res.json({ success: true, photoUrl: student.photoUrl });
//   } catch (err) {
//     console.error('PIC UPLOAD :', err);
//     res.status(500).json({ error: err.message });
//   }
// });
// // Upload student documents (multiple files)
// router.post('/upload-doc/:id', async (req, res) => {
//   try {
//     if (!req.files || !req.files.documents) return res.status(400).json({ error: 'No document files uploaded.' });
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ error: 'Student not found' });
//     if (!Array.isArray(student.documents)) {
//       student.documents = [];
//     }
//     const studentDir = getStudentDir(student.sid, student.bid, student.admissionNo);
//     const docsDir = path.join(studentDir, 'docs');
//     fs.mkdirSync(docsDir, { recursive: true });
//     let uploaded = [];
//     const docs = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
//     for (const file of docs) {
//       const docPath = path.join(docsDir, file.name);
//       await file.mv(docPath);
//       const url = `uploads/${student.sid}/${student.bid}/${student.admissionNo}/docs/${file.name}`;
//       student.documents.push({ name: file.name, url });
//       uploaded.push({ name: file.name, url });
//     }
//     await student.save();
//     res.json({ success: true, documents: uploaded });
//   } catch (err) {
//     console.error('UPLOAD DOC ERROR:', err);
//     res.status(500).json({ error: err.message });
//   }
// });
// // Download student photo
// router.get('/download-photo/:sid/:bid/:admissionNo', (req, res) => {
//   const { sid, bid, admissionNo } = req.params;
//   const dir = path.join(__dirname, '../uploads', sid, bid, admissionNo);
//   const files = fs.readdirSync(dir).filter(f => f.startsWith('photo'));
//   if (!files.length) return res.status(404).json({ error: 'Photo not found' });
//   const photoPath = path.join(dir, files[0]);
//   res.sendFile(photoPath);
// });
// // Download student document
// router.get('/download-doc/:sid/:bid/:admissionNo/:filename', (req, res) => {
//   const { sid, bid, admissionNo, filename } = req.params;
//   const docPath = path.join(__dirname, '../uploads', sid, bid, admissionNo, 'docs', filename);
//   if (!fs.existsSync(docPath)) return res.status(404).json({ error: 'File not found' });
//   res.sendFile(docPath);
// });
// // Get list of classes/sections
// router.get('/classes', async (req, res) => {
//   const { sid, bid } = req.query;
//   const data = await Student.aggregate([
//     { $match: { sid, bid } },
//     { $group: { _id: { class: "$class", section: "$section" } } }
//   ]);
//   const map = {};
//   data.forEach(d => {
//     const cls = d._id.class;
//     const sec = d._id.section;
//     if (!map[cls]) map[cls] = [];
//     if (!map[cls].includes(sec)) map[cls].push(sec);
//   });
//   const result = Object.keys(map).map(cls => ({ name: cls, sections: map[cls] }));
//   res.json(result);
// });
// module.exports = router;
//# sourceMappingURL=index.js.map