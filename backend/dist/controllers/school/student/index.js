import { prisma } from "../../../server.js";
const express = require('express');
const router = express.Router();
const Student = require('../database/models/Student');
const User = require('../database/models/User');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');
const QRCode = require('qrcode');
const FeeNarration = require('../database/models/FeeNarration');
// Helper: get student upload directory
function getStudentDir(sid, bid, admissionNo) {
    // All must be string for path.join
    return path.join(__dirname, '..', 'uploads', String(sid), String(bid), String(admissionNo));
}
// Function to generate barcode and save as image
async function generateBarcode(student) {
    const qrText = `${student.sid}|${student.bid}|${student.studentName}|${student.admissionNo}|${student.class}|${student.section}|${student.session}`;
    const qrDir = path.join(__dirname, '../uploads', student.sid, student.bid, student.admissionNo);
    fs.mkdirSync(qrDir, { recursive: true });
    const qrPath = path.join(qrDir, 'barcode.png');
    // Generate QR code image buffer and save
    await new Promise((resolve, reject) => {
        QRCode.toFile(qrPath, qrText, {
            type: 'png',
            width: 350,
            margin: 1,
            color: {
                dark: '#000',
                light: '#FFF'
            }
        }, function (err) {
            if (err)
                return reject(err);
            resolve();
        });
    });
    // Return the URL relative to your static serving
    return `uploads/${student.sid}/${student.bid}/${student.admissionNo}/barcode.png`;
}
// CRUD
router.get('/', async (req, res) => {
    const { session, sid, bid, cls, sec } = req.query;
    const query = { sid, bid };
    if (session)
        query.session = session;
    if (cls)
        query.class = cls.toUpperCase();
    if (sec)
        query.section = sec;
    const romanOrder = [
        'Nursery', 'LKG', 'UKG',
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
    ];
    const romanOrderObj = {};
    romanOrder.forEach((cls, idx) => { romanOrderObj[cls] = idx; });
    let students = await Student.aggregate([
        { $match: query },
        {
            $addFields: {
                sortableClass: {
                    $switch: {
                        branches: romanOrder.map((cls, idx) => ({
                            case: { $eq: ['$class', cls] },
                            then: idx
                        })),
                        default: 999
                    }
                }
            }
        },
        { $sort: { sortableClass: 1, section: 1 } }
    ]);
    // Process each student
    for (const student of students) {
        const studentId = student._id;
        const lastFeeTransaction = await FeeNarration.findOne({ studentId }).sort({ createdAt: -1 });
        let totalFees = 0;
        let totalPaid = 0;
        let totalBalance = 0;
        if (lastFeeTransaction) {
            totalPaid = lastFeeTransaction.totalPaid || 0;
            totalBalance = lastFeeTransaction.totalBalance || 0;
            totalFees = totalPaid + totalBalance;
        }
        student.totalFees = totalFees;
        student.totalPaid = totalPaid;
        student.totalBalance = totalBalance;
        student.totalCurrentYearPaid = lastFeeTransaction
            ? (lastFeeTransaction.totalPaid - (student.totalLastYearPaid || 0))
            : 0;
        student.totalCurrentYearFees = student.totalPayableYearly || 0;
        student.totalCurrentYearRemaningBalance = (student.totalBalancePayable || 0) - (student.totalLastRemainingBalance || 0);
        student.totalOfLastAndCurrent =
            (student.totalLastRemainingBalance || 0) +
                (student.totalCurrentYearRemaningBalance || 0);
    }
    res.json(students);
});
// Single student create (with barcode)
router.post('/', async (req, res) => {
    const { name, };
    const student = await prisma.student.create({ data: { req, : .body } });
    const barcodeUrl = await generateBarcode(student);
    student.barcodeUrl = barcodeUrl;
    await student.save();
    res.json(student);
    if (student.studentEmail != "" || student.studentMobile != "") {
        let user = await User.findOne({ email: student.studentEmail, mobile: student.studentMobile, sid: student.sid, bid: student.bid, usertype: 'Student' });
        if (user) {
            // Only update name/mobile, don't touch password
            user.name = student.studentName;
            user.mobile = student.studentMobile;
            user.email = student.studentEmail;
            await user.save();
        }
        else {
            // If password is not sent, default to '1234'
            const rawPwd = '1234';
            await User.create({
                name: student.studentName,
                email: student.studentEmail,
                mobile: student.studentMobile,
                sid: student.sid,
                bid: student.bid,
                usertype: 'Student',
                password: rawPwd, // will be handled by pre-save
                status: 'Active'
            });
        }
    }
    if (student.fatherName != "" || student.fatherEmail != "" || student.fatherMobile != "") {
        let user = await User.findOne({ email: student.fatherEmail, mobile: student.fatherMobile, sid: student.sid, bid: student.bid, usertype: 'Parent' });
        if (user) {
            // Only update name/mobile, don't touch password
            user.name = student.fatherName;
            user.mobile = student.fatherMobile;
            user.email = student.fatherEmail;
            await user.save();
        }
        else {
            // If password is not sent, default to '1234'
            const rawPwd = '1234';
            await User.create({
                name: student.fatherName,
                email: student.fatherEmail,
                mobile: student.fatherMobile,
                sid: student.sid,
                bid: student.bid,
                usertype: 'Parent',
                password: rawPwd, // will be handled by pre-save
                status: 'Active'
            });
        }
    }
    if (student.motherName != "" || student.motherEmail != "" || student.motherMobile != "") {
        let user = await User.findOne({ email: student.motherEmail, mobile: student.motherMobile, sid: student.sid, bid: student.bid, usertype: 'Parent' });
        if (user) {
            // Only update name/mobile, don't touch password
            user.name = student.motherName;
            user.mobile = student.motherMobile;
            user.email = student.motherEmail;
            await user.save();
        }
        else {
            // If password is not sent, default to '1234'
            const rawPwd = '1234';
            await User.create({
                name: student.motherName,
                email: student.motherEmail,
                mobile: student.motherMobile,
                sid: student.sid,
                bid: student.bid,
                usertype: 'Parent',
                password: rawPwd, // will be handled by pre-save
                status: 'Active'
            });
        }
    }
});
// ----------- UPDATE STUDENT -----------
router.put('/:id', async (req, res) => {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(student);
});
// ----------- DELETE STUDENT -----------
router.delete('/:id', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
// Excel Upload
router.post('/upload', async (req, res) => {
    console.log('UPLOAD ROUTE HIT!');
    console.log('REQ QUERY:', req.query);
    console.log('REQ BODY:', req.body);
    console.log('REQ FILES:', req.files);
    const sid = String(req.query.sid || '').trim();
    const bid = String(req.query.bid || '').trim();
    if (!req.files || !req.files.file) {
        console.log('NO FILE UPLOADED!');
        return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('GOT FILE:', req.files.file.name, req.files.file.size);
    const workbook = XLSX.read(req.files.file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    for (const row of data) {
        // defensive approach to set section of students which don't have section
        if (!row['section'])
            row['section'] = "A";
        console.log('ROW:', row);
        const { totalLastYearFees, totalLastYearPaid, totalLastRemainingBalance, totalCurrentYearFees, totalCurrentYearPaid, totalCurrentYearRemaningBalance, totalOfLastAndCurrent, ...cleanedRow } = row;
        const totalBalancePayable = parseFloat(totalLastRemainingBalance) || 0 + parseFloat(totalCurrentYearRemaningBalance) || 0;
        const totalPayableYearly = parseFloat(totalCurrentYearPaid) || 0;
        const session = row['Academic Session'] || row['session'] || row['Session'];
        // Defensive with AdmissionNo header
        const admissionNo = String(row.AdmissionNo || row['AdmissionNo'] || row['Admission No'] || row['admissionNo'] || '').trim();
        if (!admissionNo)
            continue; // AdmissionNo is required
        console.log("sid, bid, session ", sid, bid, session);
        // Defensive: Do not continue if sid, bid, or session missing
        if (!sid || !bid || !session)
            continue;
        // Upsert (update if exists, else insert)
        const student = await Student.findOneAndUpdate({ admissionNo, session, sid, bid }, { ...cleanedRow, sid, bid, session, admissionNo, totalPayableYearly, totalBalancePayable, totalLastYearFees, totalLastYearPaid, totalLastRemainingBalance }, { upsert: true, new: true, setDefaultsOnInsert: true });
        console.log("detail of uploaded data ", student);
        // Ensure folder structure is created
        const studentDir = getStudentDir(String(sid), String(bid), String(admissionNo));
        fs.mkdirSync(studentDir, { recursive: true });
        // Always generate barcode (or check for changes if you wish)
        const barcodeUrl = await generateBarcode(student);
        student.barcodeUrl = barcodeUrl;
        await student.save();
        // User logins creation
        // Only create if both email and mobile are provided and not empty/undefined
        if (student.studentEmail || student.studentMobile) {
            let user = await User.findOne({ email: student.studentEmail, mobile: student.studentMobile, sid, bid, usertype: 'Student' });
            if (user) {
                user.name = student.studentName;
                user.mobile = student.studentMobile;
                user.email = student.studentEmail;
                await user.save();
            }
            else {
                const rawPwd = '1234';
                await User.create({
                    name: student.studentName,
                    email: student.studentEmail,
                    mobile: student.studentMobile,
                    sid,
                    bid,
                    usertype: 'Student',
                    password: rawPwd,
                    status: 'Active'
                });
            }
        }
        if (student.fatherEmail || student.fatherMobile) {
            let userFather = await User.findOne({ email: student.fatherEmail, mobile: student.fatherMobile, sid, bid, usertype: 'Parent' });
            if (userFather) {
                userFather.name = student.fatherName;
                userFather.mobile = student.fatherMobile;
                userFather.email = student.fatherEmail;
                await userFather.save();
            }
            else {
                const rawPwd = '1234';
                console.log("creating father id");
                await User.create({
                    name: student.fatherName,
                    email: student.fatherEmail,
                    mobile: student.fatherMobile,
                    sid,
                    bid,
                    usertype: 'Parent',
                    password: rawPwd,
                    status: 'Active'
                });
                console.log("creating father id ");
            }
        }
        if (student.motherEmail || student.motherMobile) {
            let userMother = await User.findOne({ email: student.motherEmail, mobile: student.motherMobile, sid, bid, usertype: 'Parent' });
            if (userMother) {
                userMother.name = student.motherName;
                userMother.mobile = student.motherMobile;
                userMother.email = student.motherEmail;
                await userMother.save();
            }
            else {
                const rawPwd = '1234';
                await User.create({
                    name: student.motherName,
                    email: student.motherEmail,
                    mobile: student.motherMobile,
                    sid,
                    bid,
                    usertype: 'Parent',
                    password: rawPwd,
                    status: 'Active'
                });
            }
        }
        // END LOGIN CREATION
    } // end for each row
    res.json({ success: true });
});
// Excel Download by session
router.get('/download', async (req, res) => {
    const { session, sid, bid } = req.query;
    const students = await Student.find({ sid, bid, session });
    const data = students.map(s => s.toObject());
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.set('Content-Disposition', 'attachment; filename="students.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
});
// Class Promotion
router.post('/promote', async (req, res) => {
    const { sessionFrom, sessionTo, sid, bid, studentIds } = req.body;
    const classMap = {
        'Nursery': 'LKG', 'LKG': 'UKG', 'UKG': 'I', 'I': 'II', 'II': 'III', 'III': 'IV', 'IV': 'V', 'V': 'VI',
        'VI': 'VII', 'VII': 'VIII', 'VIII': 'IX', 'IX': 'X', 'X': 'XI', 'XI': 'XII'
    };
    const students = await Student.find({ _id: { $in: studentIds }, resultStatus: 'Pass', session: sessionFrom, sid, bid });
    for (const student of students) {
        const newClass = classMap[student.class] || student.class;
        const promoted = { ...student.toObject(), class: newClass, session: sessionTo, _id: undefined };
        const newStu = await Student.create(promoted);
        // Ensure folder structure and barcode for promoted student
        const studentDir = getStudentDir(sid, bid, newStu.admissionNo);
        fs.mkdirSync(studentDir, { recursive: true });
        const barcodeUrl = await generateBarcode(newStu);
        newStu.barcodeUrl = barcodeUrl;
        await newStu.save();
    }
    res.json({ success: true });
});
// Upload student photo
router.post('/upload-photo/:id', async (req, res) => {
    try {
        if (!req.files || !req.files.photo)
            return res.status(400).json({ error: 'No photo file uploaded.' });
        const student = await Student.findById(req.params.id);
        if (!student)
            return res.status(404).json({ error: 'Student not found' });
        const studentDir = getStudentDir(student.sid, student.bid, student.admissionNo);
        fs.mkdirSync(studentDir, { recursive: true });
        const ext = path.extname(req.files.photo.name);
        const photoName = 'photo' + ext;
        const photoPath = path.join(studentDir, photoName);
        await req.files.photo.mv(photoPath);
        student.photoUrl = `uploads/${student.sid}/${student.bid}/${student.admissionNo}/${photoName}`;
        await student.save();
        res.json({ success: true, photoUrl: student.photoUrl });
    }
    catch (err) {
        console.error('PIC UPLOAD :', err);
        res.status(500).json({ error: err.message });
    }
});
// Upload student documents (multiple files)
router.post('/upload-doc/:id', async (req, res) => {
    try {
        if (!req.files || !req.files.documents)
            return res.status(400).json({ error: 'No document files uploaded.' });
        const student = await Student.findById(req.params.id);
        if (!student)
            return res.status(404).json({ error: 'Student not found' });
        if (!Array.isArray(student.documents)) {
            student.documents = [];
        }
        const studentDir = getStudentDir(student.sid, student.bid, student.admissionNo);
        const docsDir = path.join(studentDir, 'docs');
        fs.mkdirSync(docsDir, { recursive: true });
        let uploaded = [];
        const docs = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
        for (const file of docs) {
            const docPath = path.join(docsDir, file.name);
            await file.mv(docPath);
            const url = `uploads/${student.sid}/${student.bid}/${student.admissionNo}/docs/${file.name}`;
            student.documents.push({ name: file.name, url });
            uploaded.push({ name: file.name, url });
        }
        await student.save();
        res.json({ success: true, documents: uploaded });
    }
    catch (err) {
        console.error('UPLOAD DOC ERROR:', err);
        res.status(500).json({ error: err.message });
    }
});
// Download student photo
router.get('/download-photo/:sid/:bid/:admissionNo', (req, res) => {
    const { sid, bid, admissionNo } = req.params;
    const dir = path.join(__dirname, '../uploads', sid, bid, admissionNo);
    const files = fs.readdirSync(dir).filter(f => f.startsWith('photo'));
    if (!files.length)
        return res.status(404).json({ error: 'Photo not found' });
    const photoPath = path.join(dir, files[0]);
    res.sendFile(photoPath);
});
// Download student document
router.get('/download-doc/:sid/:bid/:admissionNo/:filename', (req, res) => {
    const { sid, bid, admissionNo, filename } = req.params;
    const docPath = path.join(__dirname, '../uploads', sid, bid, admissionNo, 'docs', filename);
    if (!fs.existsSync(docPath))
        return res.status(404).json({ error: 'File not found' });
    res.sendFile(docPath);
});
// Get list of classes/sections
router.get('/classes', async (req, res) => {
    const { sid, bid } = req.query;
    const data = await Student.aggregate([
        { $match: { sid, bid } },
        { $group: { _id: { class: "$class", section: "$section" } } }
    ]);
    const map = {};
    data.forEach(d => {
        const cls = d._id.class;
        const sec = d._id.section;
        if (!map[cls])
            map[cls] = [];
        if (!map[cls].includes(sec))
            map[cls].push(sec);
    });
    const result = Object.keys(map).map(cls => ({ name: cls, sections: map[cls] }));
    res.json(result);
});
module.exports = router;
//# sourceMappingURL=index.js.map