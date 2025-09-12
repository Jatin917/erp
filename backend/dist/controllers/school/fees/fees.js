import puppeteer from "puppeteer";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { PHOTO_URL, prisma } from "../../../server.js";
import { getExecutablePath } from '../../../lib/services.js';
import path, { dirname } from "path";
import ejs from 'ejs';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// export const feeDoc = async (req:any, res:any) =>{
//     try {
//         const {studentId, session, admissionFee, tuitionFee, hostelFee, transportFee, concessions} = req.body;
//         if(!studentId || !session || !admissionFee || !tuitionFee){
//             return res.status(HTTP_STATUS.CONFLICT).json({success:false, message:"please ensure all fields are filled"});
//         }
//         let academicSession = await prisma.academicSession.findFirst({where:{name:session}});
//         if(!academicSession){
//             return res.status(HTTP_STATUS.BAD_REQUEST).json({success:false, message:"Academic Session don't exist"});
//         }
//         let feeDoc = await prisma.feeDoc.findFirst({where:{studentId, sessionId:academicSession.id}, select:{admissionFee:true, session:true, tuitionFee:true, transportFee:true, hostelFee:true, concessions:true, paidInSession:true, dueInSession:true, totalPayable:true}});
//         if(feeDoc){
//             return res.status(HTTP_STATUS.BAD_REQUEST).json({success:true, message:"Fee Doc already exist", feeDoc});
//         }
//         let totalPayable = 0;
//         let paidInSession = 0;
//         let dueInSession = 0;
//         totalPayable = parseFloat(admissionFee) + parseFloat(tuitionFee) + parseFloat(hostelFee ?? 0) + parseFloat(transportFee ?? 0) - parseFloat(concessions ?? 0);
//         dueInSession = totalPayable;
//         await prisma.feeDoc.create({data:{
//             student: { connect: { id: studentId } },
//             session: { connect: { id: academicSession.id } }, 
//             admissionFee,
//             tuitionFee,
//             transportFee,
//             hostelFee,
//             concessions,
//             totalPayable,
//             paidInSession,
//             dueInSession
//         }})
//     } catch (error) {
//         console.log(error)
//         return res.status(HTTP_STATUS.BAD_REQUEST).json({
//             success: false,
//             message: (error as Error).message,
//         });
//     }
// }
// export const feeTransaction = async (req: any, res: any) => {
//     try {
//       let { studentId, amountPaid, remarks, mode, createdBy, referenceId } = req.body;
//       const data = await prisma.user.findFirst({
//         where: { email: createdBy },
//         select: { id: true },
//       });
//     //   console.log("data in backend ", data);
//       if (!data) {
//         return res.status(HTTP_STATUS.CONFLICT).json({
//           message: "Sorry you can't submit fees",
//           success: false,
//         });
//       }
//       const createdById = data.id;
//       const feeDocs = await prisma.feeDoc.findMany({
//         where: { studentId },
//         orderBy: { createdAt: 'desc' },
//       });
//       const totalDue = feeDocs.reduce((acc, feeDoc) => acc + (feeDoc.dueInSession || 0), 0);
//       if (amountPaid > totalDue) {
//         return res.status(HTTP_STATUS.CONFLICT).json({
//           message: "Exceeded Amount Can't be paid",
//           success: false,
//           AmountToPaid: totalDue,
//         });
//       }
//       let amount = amountPaid;
//       // ✅ START transaction
//       await prisma.$transaction(async (tx) => {
//         // Pay off feeDocs
//         let i = 0;
//         while (amountPaid > 0 && i < feeDocs.length) {
//           const feeDoc = feeDocs[i];
//           if (!feeDoc) {
//             i++;
//             continue;
//           }
//           if (feeDoc.dueInSession > 0) {
//             const payment = Math.min(amountPaid, feeDoc.dueInSession);
//             feeDoc.paidInSession += payment;
//             feeDoc.dueInSession -= payment;
//             amountPaid -= payment;
//             await tx.feeDoc.update({
//               where: { id: feeDoc.id },
//               data: {
//                 paidInSession: feeDoc.paidInSession,
//                 dueInSession: feeDoc.dueInSession,
//               },
//             });
//           }
//           i++;
//         }
//         // Update student balances
//         const student = await tx.student.findUnique({ where: { id: studentId } });
//         if (student && student.lastYearTotalBalance > 0) {
//           amount -= student.lastYearTotalBalance;
//           await tx.student.update({
//             where: { id: studentId },
//             data: {
//               lastYearTotalPaid: {
//                 increment: student.lastYearTotalBalance,
//               },
//               lastYearTotalBalance: 0,
//             },
//           });
//         }
//         if (student && amount > 0 && student.currentYearTotalBalance > 0) {
//           amount -= student.currentYearTotalBalance;
//           await tx.student.update({
//             where: { id: studentId },
//             data: {
//               currentYearTotalPaid: {
//                 increment: student.currentYearTotalBalance,
//               },
//               currentYearTotalBalance: 0,
//             },
//           });
//         }
//         // ✅ Create feeTransaction with relations
//         await tx.feeTransaction.create({
//           data: {
//             student: { connect: { id: studentId } },
//             createdBy: { connect: { id: createdById } },
//             amountPaid,
//             remarks,
//             mode:mode as PaymentMode,
//             referenceId,
//           },
//         });
//       });
//       return res.status(HTTP_STATUS.OK).json({
//         message: "Deposited",
//         success: true,
//       });
//     } catch (error) {
//       console.log(error);
//       return res.status(HTTP_STATUS.BAD_REQUEST).json({
//         success: false,
//         message: (error as Error).message,
//       });
//     }
//   };
// export const feeReciept = async (req:any, res:any) => {
//     try {
//         const {studentId, session} = req.query;
//       // 1. Get the student first (to retrieve branchId)
// const student = await prisma.student.findFirst({
//     where: { id: studentId },
//     include: {
//       branch: {
//         include: { principal: true },
//       },
//     },
//   });
//   if (!student) throw new Error("Student not found");
//   console.log("student ", session, student.branchId);
//   // 2. Get the AcademicSession by name + branchId
//   const currentSession = await prisma.academicSession.findFirst({
//     where: {
//         // name: {
//         //     equals: session,
//         //     mode: 'insensitive', // Case insensitive match
//         //   },
//       branchId: student.branchId,
//     },
//   });
//   if (!currentSession) throw new Error("Academic session not found");
//   // 3. Get the enrollment for that session
//   const enrollment = await prisma.enrollment.findFirst({
//     where: {
//       studentId,
//       sessionId: currentSession.id,
//     },
//     include: {
//       class: {select:{classLabel:{select:{name:true}}}},
//       session: true,
//     },
//   });
//     const feeTransaction = await prisma.feeTransaction.findMany({ where:{studentId: student.id},include:{createdBy:{select:{name:true}}, student:{select:{lastYearTotalPaid:true, currentYearTotalPaid:true}}}, orderBy:{createdAt:"asc"}});
//     const feeDoc = await prisma.feeDoc.findMany({where:{
//         studentId: student.id,
//         sessionId: currentSession.id,
//     }
//     });
//       //console.log('feeDoc', feeDoc)
//       // feeDoc is an array, so get the first document if it exists
//       const feeDocItem = Array.isArray(feeDoc) && feeDoc.length > 0 ? feeDoc[0] : null;
//       const admissionFee = feeDocItem ? (feeDocItem.admissionFee || 0) : 0;
//       console.log('Admission Fee : ', admissionFee);
//       const totalPaid = student.currentYearTotalPaid + student.lastYearTotalPaid;
//       const totalPaidFromTransaction = feeTransaction.reduce((sum, n) => sum + (n.amountPaid || 0), 0);
//       const totalPayableYearly = student.currentYearTotal;
//       const totalPayable = student.currentYearTotal + student.lastYearTotal || 0
//       const totalBalance = student.lastYearTotalBalance + student.currentYearTotalBalance || 0
//       const school = {
//         name: student.branch.name || '',
//         logo: student.branch.logoUrl || '',
//         address: student.branch.address || '',
//         phone: student.branch.principal?.phone || '',
//         email:student.branch.principal?.email || '',
//       };
//       if (school.logo && !/^https?:\/\//.test(school.logo)) {
//         school.logo = PHOTO_URL.replace(/\/$/, '') + school.logo;
//       }
//       if (student.photoUrl) {
//         student.photoUrl = PHOTO_URL + student.photoUrl;
//       }
//       const html = await new Promise((resolve, reject) => {
//         ejs.renderFile(
//           path.join(__dirname, '../../../../templates/feeCollection.ejs'),
//           {
//             student:{
//                 name:student.name,
//                 admissionNo:student.admissionNo,
//                 class:enrollment?.class.classLabel.name,
//                 session
//             },
//             feeTransaction,
//             school,
//             admissionFee,
//             totalPayableYearly,
//             totalPaidFromTransaction,
//             totalPaid,
//             totalPayable,
//             totalBalance
//           },
//           (err: any, renderedHtml: unknown) => {
//             if (err) reject(err);
//             else resolve(renderedHtml);
//           }
//         );
//       });
//       const browser = await puppeteer.launch({
//         headless: true,
//         executablePath: getExecutablePath(), // or '/usr/bin/chromium' if that worked in test
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//       });    
//       const page = await browser.newPage();
//       await page.setContent(html as string);
//       const pdfBuffer = await page.pdf({
//         format: 'A4',
//         landscape: true,
//       });
//       await browser.close();
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', 'inline; filename=receipt.pdf');
//       res.send(pdfBuffer);
//     } catch (err) {
//         console.log("err is ", err)
//       res.status(500).send('Internal Server Error');
//     }
//   }
// -------------------- FeeHead --------------------
/*

export const createFeeHead = async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Name required" });

    // Prevent duplicate name per branch/school if needed later (currently global)
    const exists = await prisma.feeHead.findFirst({ where: { name } });
    if (exists) return res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: "FeeHead with this name already exists" });

    const feeHead = await prisma.feeHead.create({ data: { name } });
    return res.status(HTTP_STATUS.CREATED).json({ success: true, message: "FeeHead created", data: { feeHead } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const listFeeHeads = async (_req: any, res: any) => {
  try {
    const feeHeads = await prisma.feeHead.findMany({ orderBy: { name: "asc" } });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeHeads fetched", data: { feeHeads } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const updateFeeHead = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id param required" });
    if (!name) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "name required" });

    const feeHead = await prisma.feeHead.update({
      where: { id },
      data: { name },
    });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeHead updated", data: { feeHead } });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeHead not found" });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const deleteFeeHead = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id param required" });

    // Optional: check for dependent templates/docs before deleting
    const templatesCount = await prisma.feeTemplate.count({ where: { feeHeadId: id } });
    if (templatesCount > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Cannot delete FeeHead: templates exist using this head" });
    }

    await prisma.feeHead.delete({ where: { id } });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeHead deleted" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeHead not found" });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- FeeTemplate --------------------
export const createFeeTemplate = async (req: any, res: any) => {
  try {
    const { sessionId, branchId, classLabelId, feeHeadId, totalAmount, defaultDiscounts, defaultLateFees } = req.body;

    if (!sessionId || !branchId || !classLabelId || !feeHeadId || totalAmount == null) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Missing required fields" });
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "totalAmount must be a positive number" });
    }

    // Prevent duplicate template for same class/session/branch/head
    const exists = await prisma.feeTemplate.findFirst({
      where: { sessionId, branchId, classLabelId, feeHeadId }
    });
    if (exists) {
      return res.status(HTTP_STATUS.CONFLICT).json({ success: false, message: "Template already exists for this class/session/feeHead" });
    }

    const template = await prisma.feeTemplate.create({
      data: {
        sessionId,
        branchId,
        classLabelId,
        feeHeadId,
        amount:totalAmount,
        discounts:defaultDiscounts,
        lateFees:defaultLateFees
      }
    });

    return res.status(HTTP_STATUS.CREATED).json({ success: true, message: "FeeTemplate created", data: { template } });
  } catch (err: any) {
    if (err.code === "P2003") {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Invalid reference (session/branch/class/feeHead not found)" });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const getFeeTemplates = async (req: any, res: any) => {
  try {
    const { branchId, sessionId, classLabelId } = req.query;
    const where: any = {};
    if (branchId) where.branchId = branchId;
    if (sessionId) where.sessionId = sessionId;
    if (classLabelId) where.classId = classLabelId;

    const templates = await prisma.feeTemplate.findMany({ where });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeTemplates fetched", data: { templates } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const updateFeeTemplate = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    // Basic validation: cannot set negative totalAmount if provided
    if (payload.totalAmount != null && (typeof payload.totalAmount !== "number" || payload.totalAmount <= 0)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "totalAmount must be positive" });
    }

    const template = await prisma.feeTemplate.update({ where: { id }, data: payload });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeTemplate updated", data: { template } });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeTemplate not found" });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const deleteFeeTemplate = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    const used = await prisma.feeDoc.count({ where: { templateId: id } });
    if (used > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Cannot delete template: feeDocs exist" });
    }

    await prisma.feeTemplate.delete({ where: { id } });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeTemplate deleted" });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeTemplate not found" });
    }
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- FeeDoc --------------------
export const generateFeeDocs = async (req: any, res: any) => {
  try {
    const { classId, classLabelId, sessionId } = req.body;
    if (!classId || !sessionId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "classId & sessionId required" });

    // use transaction - if any creation fails, rollback
    const result = await prisma.$transaction(async (tx) => {
      // find students and templates
      const enrollments = await tx.enrollment.findMany({ where: { classId, sessionId } });
      const templates = await tx.feeTemplate.findMany({ where: { classLabelId, sessionId } });

      if (enrollments.length === 0) throw new Error("No students found for this class & session");
      if (templates.length === 0) throw new Error("No fee templates found for this class & session");

      const created: any[] = [];
      for (const student of students) {
        for (const template of templates) {
          // avoid duplicates if same doc already exists
          const exists = await tx.feeDoc.findFirst({
            where: { enrollmentId: student.id, templateId: template.id, feeHeadId: template.feeHeadId, sessionId }
          });
          if (exists) {
            created.push({ skipped: true, studentId: student.id, templateId: template.id });
            continue;
          }

          const doc = await tx.feeDoc.create({
            data: {
              studentId: student.id,
              feeHeadId: template.feeHeadId,
              templateId: template.id,
              sessionId,
              amount: template.totalAmount ?? template.totalAmount, // adjust field names if needed
              status: "PENDING",
            }
          });
          created.push(doc);

          // Optionally generate default feePayments based on paymentType or template defaults
          // (left to explicit endpoint addFeePayments or automatic logic here)
        }
      }

      return created;
    });

    return res.status(HTTP_STATUS.CREATED).json({ success: true, message: "FeeDocs generated", data: { feeDocs: result } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const getStudentFeeDocs = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "studentId required" });

    const docs = await prisma.feeDoc.findMany({
      where: { studentId },
      include: { payments: true } // adjust include names to your schema: feePayments vs payments
    });

    return res.status(HTTP_STATUS.OK).json({ success: true, message: "Student FeeDocs fetched", data: { docs } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const updateFeeDoc = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    // Validate sensible fields, e.g., amount must be positive if provided
    if (payload.amount != null && (typeof payload.amount !== "number" || payload.amount < 0)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "amount must be a positive number" });
    }

    const doc = await prisma.feeDoc.update({ where: { id }, data: payload });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeeDoc updated", data: { doc } });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeDoc not found" });
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// -------------------- FeePayment --------------------
export const addFeePayment = async (req: any, res: any) => {
  try {
    const { feeDocId } = req.params;
    const { amount, dueDate, name, academicMonthId } = req.body;

    if (!feeDocId || amount == null || !dueDate || !name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Missing fields (feeDocId, amount, dueDate, name)" });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "amount must be positive number" });
    }

    // ensure feeDoc exists
    const feeDoc = await prisma.feeDoc.findUnique({ where: { id: feeDocId } });
    if (!feeDoc) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeeDoc not found" });

    const payment = await prisma.feePayment.create({
      data: {
        feeDocId,
        amount,
        name,
        dueDate: new Date(dueDate),
        academicMonthId: academicMonthId || null
      }
    });

    return res.status(HTTP_STATUS.CREATED).json({ success: true, message: "FeePayment created", data: { payment } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const getFeePayments = async (req: any, res: any) => {
  try {
    const { feeDocId } = req.params;
    if (!feeDocId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "feeDocId required" });

    const payments = await prisma.feePayment.findMany({ where: { feeDocId }, orderBy: { dueDate: "asc" } });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeePayments fetched", data: { payments } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const updateFeePayment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    if (payload.amount != null && (typeof payload.amount !== "number" || payload.amount < 0)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "amount must be a positive number" });
    }

    const payment = await prisma.feePayment.update({ where: { id }, data: payload });
    return res.status(HTTP_STATUS.OK).json({ success: true, message: "FeePayment updated", data: { payment } });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "FeePayment not found" });
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

*/
// -------------------- FeeTransaction --------------------
/**
 * createTransaction:
 * - Validates input
 * - Finds due feePayments for the student ordered by dueDate (oldest first)
 * - Allocates payment amount sequentially to due payments (partial if needed)
 * - Creates a feeTransaction and feeTransactionItems atomically
 */
/*
export const createTransaction = async (req: any, res: any) => {
  try {
    const { studentId, amount, mode, referenceId, remarks, createdById } = req.body;

    if (!studentId || !amount || !mode || !createdById) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Missing fields" });
    }

    let remaining = amount;
    const duePayments = await prisma.feePayment.findMany({
      where: { feeDoc: { studentId }, isPaid: false },
      orderBy: { deadline: "asc" }
    });

    const allocations: any[] = [];

    for (const payment of duePayments) {
      if (remaining <= 0) break;

      const toPay = Math.min(remaining, payment.amount - (payment.paidAmount || 0));
      remaining -= toPay;

      await prisma.feePayment.update({
        where: { id: payment.id },
        data: {
          paidAmount: { increment: toPay },
          isPaid: (payment.paidAmount + toPay) >= payment.amount
        }
      });

      allocations.push({ feePaymentId: payment.id, amount: toPay });
    }

    const receiptNo = `RCPT-${Date.now()}`; // can improve later with sequence

    const txn = await prisma.feeTransaction.create({
      data: {
        studentId,
        amount,
        mode,
        referenceId,
        remarks,
        allocations,
        receiptNo,
        createdById
      }
    });

    return res.json({ success: true, message: "Transaction created", data: { txn } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const getStudentTransactions = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    if (!studentId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "studentId required" });

    const txns = await prisma.feeTransaction.findMany({
      where: { studentId },
      include: { items: true }
    });

    return res.status(HTTP_STATUS.OK).json({ success: true, message: "Transactions fetched", data: { txns } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

export const getBranchTransactions = async (req: any, res: any) => {
  try {
    const { branchId } = req.params;
    if (!branchId) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "branchId required" });

    // find transactions where student's branch = branchId
    const txns = await prisma.feeTransaction.findMany({
      where: { student: { branchId } },
      include: { items: true, student: true }
    });

    return res.status(HTTP_STATUS.OK).json({ success: true, message: "Branch transactions fetched", data: { txns } });
  } catch (err: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

*/ 
//# sourceMappingURL=fees.js.map