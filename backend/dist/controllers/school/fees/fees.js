import puppeteer from "puppeteer";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { PHOTO_URL, prisma } from "../../../server.js";
import { getExecutablePath } from '../../../lib/services.js';
import path, { dirname } from "path";
import ejs from 'ejs';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const feeDoc = async (req, res) => {
    try {
        const { studentId, session, admissionFee, tuitionFee, hostelFee, transportFee, concessions } = req.body;
        if (!studentId || !session || !admissionFee || !tuitionFee) {
            return res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: "please ensure all fields are filled" });
        }
        let academicSession = await prisma.academicSession.findFirst({ where: { name: session } });
        if (!academicSession) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Academic Session don't exist" });
        }
        let feeDoc = await prisma.feeDoc.findFirst({ where: { studentId, sessionId: academicSession.id }, select: { admissionFee: true, session: true, tuitionFee: true, transportFee: true, hostelFee: true, concessions: true, paidInSession: true, dueInSession: true, totalPayable: true } });
        if (feeDoc) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: true, message: "Fee Doc already exist", feeDoc });
        }
        let totalPayable = 0;
        let paidInSession = 0;
        let dueInSession = 0;
        totalPayable = parseFloat(admissionFee) + parseFloat(tuitionFee) + parseFloat(hostelFee ?? 0) + parseFloat(transportFee ?? 0) - parseFloat(concessions ?? 0);
        dueInSession = totalPayable;
        await prisma.feeDoc.create({ data: {
                student: { connect: { id: studentId } },
                session: { connect: { id: academicSession.id } },
                admissionFee,
                tuitionFee,
                transportFee,
                hostelFee,
                concessions,
                totalPayable,
                paidInSession,
                dueInSession
            } });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message,
        });
    }
};
export const feeTransaction = async (req, res) => {
    try {
        let { studentId, amountPaid, remarks, mode, createdBy, referenceId } = req.body;
        const data = await prisma.user.findFirst({
            where: { email: createdBy },
            select: { id: true },
        });
        //   console.log("data in backend ", data);
        if (!data) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: "Sorry you can't submit fees",
                success: false,
            });
        }
        const createdById = data.id;
        const feeDocs = await prisma.feeDoc.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
        });
        const totalDue = feeDocs.reduce((acc, feeDoc) => acc + (feeDoc.dueInSession || 0), 0);
        if (amountPaid > totalDue) {
            return res.status(HTTP_STATUS.CONFLICT).json({
                message: "Exceeded Amount Can't be paid",
                success: false,
                AmountToPaid: totalDue,
            });
        }
        let amount = amountPaid;
        // ✅ START transaction
        await prisma.$transaction(async (tx) => {
            // Pay off feeDocs
            let i = 0;
            while (amountPaid > 0 && i < feeDocs.length) {
                const feeDoc = feeDocs[i];
                if (!feeDoc) {
                    i++;
                    continue;
                }
                if (feeDoc.dueInSession > 0) {
                    const payment = Math.min(amountPaid, feeDoc.dueInSession);
                    feeDoc.paidInSession += payment;
                    feeDoc.dueInSession -= payment;
                    amountPaid -= payment;
                    await tx.feeDoc.update({
                        where: { id: feeDoc.id },
                        data: {
                            paidInSession: feeDoc.paidInSession,
                            dueInSession: feeDoc.dueInSession,
                        },
                    });
                }
                i++;
            }
            // Update student balances
            const student = await tx.student.findUnique({ where: { id: studentId } });
            if (student && student.lastYearTotalBalance > 0) {
                amount -= student.lastYearTotalBalance;
                await tx.student.update({
                    where: { id: studentId },
                    data: {
                        lastYearTotalPaid: {
                            increment: student.lastYearTotalBalance,
                        },
                        lastYearTotalBalance: 0,
                    },
                });
            }
            if (student && amount > 0 && student.currentYearTotalBalance > 0) {
                amount -= student.currentYearTotalBalance;
                await tx.student.update({
                    where: { id: studentId },
                    data: {
                        currentYearTotalPaid: {
                            increment: student.currentYearTotalBalance,
                        },
                        currentYearTotalBalance: 0,
                    },
                });
            }
            // ✅ Create feeTransaction with relations
            await tx.feeTransaction.create({
                data: {
                    student: { connect: { id: studentId } },
                    createdBy: { connect: { id: createdById } },
                    amountPaid,
                    remarks,
                    mode: mode,
                    referenceId,
                },
            });
        });
        return res.status(HTTP_STATUS.OK).json({
            message: "Deposited",
            success: true,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: error.message,
        });
    }
};
export const feeReciept = async (req, res) => {
    try {
        const { studentId, session } = req.query;
        // 1. Get the student first (to retrieve branchId)
        const student = await prisma.student.findFirst({
            where: { id: studentId },
            include: {
                branch: {
                    include: { principal: true },
                },
            },
        });
        if (!student)
            throw new Error("Student not found");
        console.log("student ", session, student.branchId);
        // 2. Get the AcademicSession by name + branchId
        const currentSession = await prisma.academicSession.findFirst({
            where: {
                // name: {
                //     equals: session,
                //     mode: 'insensitive', // Case insensitive match
                //   },
                branchId: student.branchId,
            },
        });
        if (!currentSession)
            throw new Error("Academic session not found");
        // 3. Get the enrollment for that session
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                studentId,
                sessionId: currentSession.id,
            },
            include: {
                class: true,
                session: true,
            },
        });
        const feeTransaction = await prisma.feeTransaction.findMany({ where: { studentId: student.id }, include: { createdBy: { select: { name: true } }, student: { select: { lastYearTotalPaid: true, currentYearTotalPaid: true } } }, orderBy: { createdAt: "asc" } });
        const feeDoc = await prisma.feeDoc.findMany({ where: {
                studentId: student.id,
                sessionId: currentSession.id,
            }
        });
        //console.log('feeDoc', feeDoc)
        // feeDoc is an array, so get the first document if it exists
        const feeDocItem = Array.isArray(feeDoc) && feeDoc.length > 0 ? feeDoc[0] : null;
        const admissionFee = feeDocItem ? (feeDocItem.admissionFee || 0) : 0;
        console.log('Admission Fee : ', admissionFee);
        const totalPaid = student.currentYearTotalPaid + student.lastYearTotalPaid;
        const totalPaidFromTransaction = feeTransaction.reduce((sum, n) => sum + (n.amountPaid || 0), 0);
        const totalPayableYearly = student.currentYearTotal;
        const totalPayable = student.currentYearTotal + student.lastYearTotal || 0;
        const totalBalance = student.lastYearTotalBalance + student.currentYearTotalBalance || 0;
        const school = {
            name: student.branch.name || '',
            logo: student.branch.logoUrl || '',
            address: student.branch.address || '',
            phone: student.branch.principal?.phone || '',
            email: student.branch.principal?.email || '',
        };
        if (school.logo && !/^https?:\/\//.test(school.logo)) {
            school.logo = PHOTO_URL.replace(/\/$/, '') + school.logo;
        }
        if (student.photoUrl) {
            student.photoUrl = PHOTO_URL + student.photoUrl;
        }
        const html = await new Promise((resolve, reject) => {
            ejs.renderFile(path.join(__dirname, '../../../../templates/feeCollection.ejs'), {
                student: {
                    name: student.name,
                    admissionNo: student.admissionNo,
                    class: enrollment?.class.name,
                    session
                },
                feeTransaction,
                school,
                admissionFee,
                totalPayableYearly,
                totalPaidFromTransaction,
                totalPaid,
                totalPayable,
                totalBalance
            }, (err, renderedHtml) => {
                if (err)
                    reject(err);
                else
                    resolve(renderedHtml);
            });
        });
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: getExecutablePath(), // or '/usr/bin/chromium' if that worked in test
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
        });
        await browser.close();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=receipt.pdf');
        res.send(pdfBuffer);
    }
    catch (err) {
        console.log("err is ", err);
        res.status(500).send('Internal Server Error');
    }
};
//# sourceMappingURL=fees.js.map