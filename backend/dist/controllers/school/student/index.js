// @ts-nocheck
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import bcrypt from "bcrypt";
import { defaultPassword, prisma } from "../../../server.js"; // your prisma instance
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import * as XLSX from "xlsx";
function getStudentDir(sid, bid, admissionNo) {
    // All must be string for path.join
    return path.join(__dirname, '..', 'uploads', String(sid), String(bid), String(admissionNo));
}
// ----------------------
// Generate Barcode
// ----------------------
async function generateBarcode(student) {
    const qrText = `${student.id}|${student.branchId}|${student.user.name}|${student.rollNo}|${student.enrollments.id || ""}|${student.sessionId || ""}`;
    // Store under /uploads/{schoolId}/{branchId}/barcodes/{studentId}.png
    const qrDir = getStudentDir(student.schoolId, student.branchId, student.admissionNo);
    const qrPath = path.join(qrDir, `${student.id}.png`);
    await new Promise((resolve, reject) => {
        QRCode.toFile(qrPath, qrText, {
            type: "png",
            width: 350,
            margin: 1,
            color: { dark: "#000", light: "#FFF" },
        }, (err) => {
            if (err)
                return reject(err);
            resolve(true);
        });
    });
    return `uploads/${student.schoolId}/${student.branchId}/barcodes/${student.id}.png`;
}
// ----------------------
// Create / Find User Helper
// ----------------------
async function findOrCreateUser(role, name, email, phone) {
    if (!email && !phone)
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
studentId, className, branchId, section, sessionId, rollNo) {
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
// ----------------------
// Main Create Student Function
// ----------------------
export const createStudent = async (req, res) => {
    try {
        const data = req.body;
        const { session, class: classAsParam, branchId, rollNo } = data;
        const normalized = normalizeSession(session);
        await prisma.$transaction(async (tx) => {
            // ---------- 1. Check Session ----------
            const sessionIsThere = await tx.academicSession.findFirst({
                where: { name: normalized },
            });
            if (!sessionIsThere) {
                throw new Error("Academic Session does not exist");
            }
            // ---------- 2. Create Student User ----------
            const studentUser = await findOrCreateUser("STUDENT", data.studentName, data.studentEmail, data.studentMobile);
            if (!studentUser)
                throw new Error("No student user Found");
            // ---------- 3. Create Parent Users ----------
            let fatherParent = null;
            let motherParent = null;
            if (data.fatherName || data.fatherEmail || data.fatherMobile) {
                const fatherUser = await findOrCreateUser("FATHER", data.fatherName, data.fatherEmail, data.fatherMobile);
                if (fatherUser) {
                    fatherParent = await tx.parent.create({
                        data: { type: "FATHER", userId: fatherUser.id },
                    });
                }
            }
            if (data.motherName || data.motherEmail || data.motherMobile) {
                const motherUser = await findOrCreateUser("MOTHER", data.motherName, data.motherEmail, data.motherMobile);
                if (motherUser) {
                    motherParent = await tx.parent.create({
                        data: { type: "MOTHER", userId: motherUser.id },
                    });
                }
            }
            // ---------- 4. Create Student ----------
            const student = await tx.student.create({
                data: {
                    ...data, // pass extra fields as is
                    userId: studentUser.id,
                    fatherId: fatherParent?.id,
                    motherId: motherParent?.id,
                },
                include: { user: true },
            });
            // ---------- 5. Enrollment ----------
            await createEnrollment(tx, classAsParam, branchId, student.id, data.section, sessionIsThere.id, rollNo);
            // ---------- 6. Barcode ----------
            const barcodeUrl = await generateBarcode(student);
            await tx.student.update({
                where: { id: student.id },
                data: { barcodeUrl },
            });
            // ---------- 7. FeeDocs ----------
            let tuitionFee = 0;
            let admissionFee = 0;
            if (!data.currentYearAdmissionFee && !data.currentYearTuitionFee) {
                // fallback when both are not provided
                tuitionFee = data.currentYearTotal || 0;
            }
            else {
                tuitionFee = data.currentYearTuitionFee || 0;
                admissionFee = data.currentYearAdmissionFee || 0;
            }
            await tx.feeDoc.create({
                data: {
                    studentId: student.id,
                    sessionId: sessionIsThere.id,
                    admissionFee,
                    tuitionFee,
                    totalPayable: admissionFee + tuitionFee,
                    dueInSession: admissionFee + tuitionFee - (data.currentYearTotalPaid || 0),
                },
            });
            // ---------- 8. Last year fees (optional) ----------
            if (data.lastYearAdmissionFee || data.lastYearTuitionFee || data.lastYearTotal) {
                const lastSession = await tx.academicSession.findFirst({
                    where: { branchId, isCurrent: false },
                    orderBy: { createdAt: "desc" },
                });
                if (lastSession) {
                    await tx.feeDoc.create({
                        data: {
                            studentId: student.id,
                            sessionId: lastSession.id,
                            admissionFee: data.lastYearAdmissionFee || 0,
                            tuitionFee: data.lastYearTuitionFee || data.lastYearTotal || 0,
                            totalPayable: (data.lastYearAdmissionFee || 0) +
                                (data.lastYearTuitionFee || data.lastYearTotal || 0),
                            dueInSession: data.lastYearTotalBalance || 0,
                        },
                    });
                }
                else {
                    // log for debugging but don’t mix with current session
                    console.warn(`No lastSession found for branch ${branchId}, student ${student.id}`);
                }
            }
        });
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: "Student created successfully",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
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
        const filePath = req.file.path; // multer stores file temporarily
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        let results = [];
        for (const row of sheetData) {
            try {
                const student = await prisma.$transaction(async (tx) => {
                    // 1. Student User
                    const studentUser = await findOrCreateUser("STUDENT", row.studentName, row.studentEmail, row.studentMobile);
                    if (!studentUser)
                        throw new Error("Student user creation failed");
                    // 2. Father (if any)
                    let fatherParent = null;
                    if (row.fatherName || row.fatherEmail || row.fatherMobile) {
                        const fatherUser = await findOrCreateUser("FATHER", row.fatherName, row.fatherEmail, row.fatherMobile);
                        if (fatherUser) {
                            fatherParent = await tx.parent.create({
                                data: { type: "FATHER", userId: fatherUser.id },
                            });
                        }
                    }
                    // 3. Mother (if any)
                    let motherParent = null;
                    if (row.motherName || row.motherEmail || row.motherMobile) {
                        const motherUser = await findOrCreateUser("MOTHER", row.motherName, row.motherEmail, row.motherMobile);
                        if (motherUser) {
                            motherParent = await tx.parent.create({
                                data: { type: "MOTHER", userId: motherUser.id },
                            });
                        }
                    }
                    // 4. Student record
                    const student = await tx.student.create({
                        data: {
                            userId: studentUser.id,
                            branchId: row.branchId,
                            rollNo: row.rollNo,
                            studentId: row.studentId,
                            studentEmail: row.studentEmail,
                            studentMobile: row.studentMobile,
                            fatherName: row.fatherName,
                            fatherEmail: row.fatherEmail,
                            fatherMobile: row.fatherMobile,
                            motherName: row.motherName,
                            motherEmail: row.motherEmail,
                            motherMobile: row.motherMobile,
                            lastYearTotal: row.totalLastYearFees,
                            lastYearTotalBalance: row.totalLastRemainingBalance,
                            lastYearTotalPaid: row.totalLastYearPaid,
                            currentYearTotal: row.totalCurrentYearFees,
                            currentYearTotalPaid: row.totalCurrentYearPaid,
                            currentYearTotalBalance: row.totalCurrentYearRemaningBalance,
                            fatherId: fatherParent?.id || null,
                            motherId: motherParent?.id || null,
                        },
                        include: { user: true },
                    });
                    // 5. Barcode
                    const barcodeUrl = await generateBarcode(student);
                    await tx.student.update({
                        where: { id: student.id },
                        data: { barcodeUrl },
                    });
                    // 6. Current year fees
                    let tuitionFee = 0;
                    let admissionFee = 0;
                    if (!row.currentYearAdmissionFee && !row.currentYearTuitionFee) {
                        tuitionFee = row.currentYearTotal || 0;
                    }
                    else {
                        tuitionFee = row.currentYearTuitionFee || 0;
                        admissionFee = row.currentYearAdmissionFee || 0;
                    }
                    await tx.feeDoc.create({
                        data: {
                            studentId: student.id,
                            sessionId: row.sessionId,
                            admissionFee,
                            tuitionFee,
                            totalPayable: admissionFee + tuitionFee,
                            dueInSession: (admissionFee + tuitionFee) - (row.currentYearTotalPaid || 0),
                        },
                    });
                    // 7. Last year fees (optional)
                    if (row.lastYearAdmissionFee || row.lastYearTuitionFee || row.lastYearTotal) {
                        const lastSession = await tx.academicSession.findFirst({
                            where: { branchId: row.branchId, isCurrent: false },
                            orderBy: { createdAt: "desc" },
                        });
                        if (lastSession) {
                            await tx.feeDoc.create({
                                data: {
                                    studentId: student.id,
                                    sessionId: lastSession.id,
                                    admissionFee: row.lastYearAdmissionFee || 0,
                                    tuitionFee: row.lastYearTuitionFee || row.lastYearTotal || 0,
                                    totalPayable: (row.lastYearAdmissionFee || 0) + (row.lastYearTuitionFee || row.lastYearTotal || 0),
                                    dueInSession: row.lastYearTotalBalance || 0,
                                },
                            });
                        }
                        else {
                            // fallback: don't mix with current session
                            console.warn(`No lastSession found for branch ${row.branchId}, student ${student.id}`);
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
//     const totalBalancePayable = parseFloat(totalLastRemainingBalance) || 0 + parseFloat(totalCurrentYearRemaningBalance) || 0;
//     const totalPayableYearly = parseFloat(totalCurrentYearPaid) || 0;
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