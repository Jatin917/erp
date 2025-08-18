import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { prisma } from "../../../server.js";
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
//# sourceMappingURL=fees.js.map