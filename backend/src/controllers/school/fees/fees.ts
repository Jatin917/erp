import puppeteer from "puppeteer";
import { FeePaymentType, PaymentStatus, type PaymentMode } from "../../../../generated/prisma/index.js";
import { HTTP_STATUS } from "../../../lib/http-codes.js";
import { PHOTO_URL, prisma } from "../../../server.js";
import {getExecutablePath, normalizePath} from '../../../lib/services.js'
import { Prisma } from "@prisma/client/extension";
import path, { dirname } from "path";
import ejs from 'ejs';
import { fileURLToPath } from "url";
import { sendError, sendSuccess } from "@src/lib/utils.js";
import { MONTHS, numsSuffix } from "@src/lib/contants.js";
import { processFeePayment } from "@src/services/fees/index.js";
import { getEnrollment } from "@src/services/student/index.js";
import { getBranchService } from "@src/services/school/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const updatePayments = async(tx:Prisma.TransactionClient, feeDocId:string, amount:number, paymentType:FeePaymentType, payments:any) =>{
  if (paymentType === FeePaymentType.ONE_TIME) {
        // Expecting only one dueDate
        if (payments.length !== 1) throw new Error("One-time payment requires exactly 1 dueDate");

        const payment = await tx.feePayment.update({
          where:{
            id:payments[0].id
          },
          
          data: {
            amount: amount,
          },
        });
      }

      if (paymentType === FeePaymentType.MONTHLY) {
        // Expect dueDates.length === number of months
        const perMonth = amount / payments.length;

        for (let i = 0;i<payments.length;i++) {
          const paymentId = payments[i].id;
          const payment = await tx.feePayment.update({
            where:{id:paymentId},
            data: {
              amount: perMonth,
            },
          });
        }
      }

      if (paymentType === FeePaymentType.INSTALLMENT) {

        const perInstallment = amount / payments.length;

        for (let i = 0;i<payments.length;i++) {
          const paymentId = payments[i].id;
          const payment = await tx.feePayment.update({
            where:{
              id:paymentId
            },
            data: {
              amount: perInstallment,
            },
          });
        }
}
return true;
}

const createPayment = async (
  tx: Prisma.TransactionClient,
  doc: { id: string },
  amount:number,
  feeHeadName:string,
  paymentType: FeePaymentType,
  dueDates: Date[]
) =>{
  if (paymentType === FeePaymentType.ONE_TIME) {
        // Expecting only one dueDate
        if (dueDates.length !== 1) throw new Error("One-time payment requires exactly 1 dueDate");

        const payment = await tx.feePayment.create({
          data: {
            feeDocId: doc.id,
            amount: amount,
            dueDate: dueDates[0] ? new Date(dueDates[0]) : new Date(),
            name:feeHeadName
          },
        });
      }

      if (paymentType === FeePaymentType.MONTHLY) {
        // Expect dueDates.length === number of months
        const perMonth = amount / dueDates.length;

        for (let i = 0;i<dueDates.length;i++) {
          const d = dueDates[i] ?? new Date();
          const month = d.getMonth();
          const payment = await tx.feePayment.create({
            data: {
              feeDocId: doc.id,
              amount: perMonth,
              dueDate: new Date(d),
              name:`${MONTHS[month]} Payment `
            },
          });
        }
      }

      if (paymentType === FeePaymentType.INSTALLMENT) {

        const perInstallment = amount / dueDates.length;

        for (let i = 0;i<dueDates.length;i++) {
          const d = dueDates[i] ?? new Date();
          const payment = await tx.feePayment.create({
            data: {
              feeDocId: doc.id,
              amount: perInstallment,
              dueDate: new Date(d),
              name:i+`${numsSuffix[i]} Installement`
            },
          });
        }
}
return true;
}


export function generateDueDates(
  paymentType: FeePaymentType,
  options: {
    dueDate?: string | Date;           // user-provided (for ONE_TIME or MONTHLY start date)
    installments?: number;      // from template (for INSTALLMENTS)
    months?: number;            // number of months (for MONTHLY)
    templateDueDate?: string;   // base dueDate from template (for INSTALLMENTS)
  }
): Date[] {
  const dates: Date[] = [];

  if (paymentType === FeePaymentType.ONE_TIME) {
    if (!options.dueDate) throw new Error("dueDate is required for ONE_TIME");
    dates.push(new Date(options.dueDate));
  }

  if (paymentType === FeePaymentType.MONTHLY) {
    if (!options.dueDate) throw new Error("Start dueDate required for MONTHLY");
    const months = options.months || 12;
    const start = new Date(options.dueDate);

    for (let i = 0; i < months; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      dates.push(d);
    }
  }

  if (paymentType === FeePaymentType.INSTALLMENT) {
    if (!options.templateDueDate || !options.installments) {
      throw new Error("templateDueDate and installments required for INSTALLMENTS");
    }

    const start = new Date(options.templateDueDate);
    for (let i = 0; i < options.installments; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      dates.push(d);
    }
  }

  return dates;
}

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





// -------------------- FeeReciept --------------------

  

export const feeRecieptForTransaction = async (req: any, res: any) => {
  try {
    const { branchId, studentId, transactionId } = req.query;

    const currentSession = await prisma.academicSession.findFirst({
      where: { branchId, isCurrent: true },
      include: {
        branch: {
          select: {
            school: true,
            address: true,
            name: true,
            logoUrl: true,
            principal: true,
          },
        },
      },
    });
    if (!currentSession)
      return sendError(res, "No Session Found for branch", HTTP_STATUS.BAD_REQUEST);

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, sessionId: currentSession.id },
      include: {
        student: true,
        class: { select: { classLabel: { select: { name: true } } } },
        session: true,
      },
    });
    if (!enrollment) return sendError(res, "Enrollment not found", HTTP_STATUS.CONFLICT);

    const student = enrollment.student;
    if (!student) return sendError(res, "Student does not exist", HTTP_STATUS.CONFLICT);

    const transaction = await prisma.feePaymentAllocation.findFirst({
      where: { transactionId: transactionId },
      include: { transaction: true, feePayment: true },
    });

    const school = {
      name: currentSession.branch.name || "",
      principalName:currentSession.branch.principal?.name,
      logo: currentSession.branch.logoUrl || "",
      address: currentSession.branch.address || "",
      phone: currentSession.branch.principal?.phone || "",
      email: currentSession.branch.principal?.email || "",
    };

    // ✅ Normalize URLs
    const normalizePath = (p: string) => p?.replace(/\\/g, "/").replace(/^\/+/, "") || "";

    if (school.logo && !/^https?:\/\//.test(school.logo)) {
      school.logo = `${PHOTO_URL.replace(/\/+$/, "")}/${normalizePath(school.logo)}`;
    }

    if (student.photoUrl && !/^https?:\/\//.test(student.photoUrl)) {
      student.photoUrl = `${PHOTO_URL.replace(/\/+$/, "")}/${normalizePath(student.photoUrl)}`;
    }

    console.log("Resolved School Logo →", school.logo);
    console.log("Resolved Student Photo →", student.photoUrl, transaction?.transaction);

    // ✅ Render EJS
    const html = await new Promise<string>((resolve, reject) => {
      ejs.renderFile(
        path.join(__dirname, "../../../../templates/feeCollection.ejs"),
        {
          student: {
            name: student.name,
            admissionNo: student.admissionNo,
            class: enrollment?.class.classLabel.name,
            session: currentSession.name,
            photoUrl: student.photoUrl,
          },
          transaction: transaction?.transaction,
          payment: transaction?.feePayment,
          school,
          PHOTO_URL,
        },
        (err, renderedHtml) => (err ? reject(err) : resolve(renderedHtml as string))
      );
    });

    // ✅ Puppeteer launch
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: getExecutablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ✅ Set content and wait for images
    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true, // crucial for images
    });

    await browser.close();

    // ✅ Send headers for browser preview
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=receipt.pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.log("Error generating receipt PDF:", err);
    res.status(500).send("Internal Server Error");
  }
};


// -------------------- FeeHead --------------------


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

export const listFeeHeads = async (req: any, res: any) => {
  try {
    const feeHeads = await prisma.feeHead.findMany({select:{name:true, id:true}, orderBy: { name: "asc" } });
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
    console.log("fee head ", feeHead, id, name);
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
    const {branchId, classLabel, feeHeadId, totalAmount, defaultDiscounts, defaultLateFees, paymentType, numberOfInstallments:installements, dueDate } = req.body;

    if ( !branchId  || !feeHeadId || totalAmount == null || !dueDate || !paymentType) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "Missing required fields" });
    }
    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "totalAmount must be a positive number" });
    }
    if(paymentType===FeePaymentType.INSTALLMENT && !installements){
      return sendError(res, "installments should be provided", HTTP_STATUS.BAD_REQUEST)
    }
    let classLabelId: string | null = null;

    // -------- Resolve classLabelId --------
    if (classLabel && branchId) {
      const classLabelExist = await prisma.classLabel.findFirst({
        where: { branchId, name: classLabel as string },
      });
      if (classLabelExist) {
        classLabelId = classLabelExist.id;
      }
    }
    if(!classLabelId){
      return sendError(res, "ClassLabel dont exist", HTTP_STATUS.CONFLICT)
    }
    const branch = await prisma.branch.findFirst({
  where: { id: branchId },
  include: { academicSession: {select:{id:true, startMonth:true, isCurrent:true}} },
});

if (!branch) {
  return sendError(res, "Branch doesn't exist", HTTP_STATUS.CONFLICT);
}

const currentSession = branch.academicSession.find((s) => s.isCurrent);
if(!currentSession){
  return sendError(res, "Session don't exist ", HTTP_STATUS.CONFLICT);
}
const sessionId = currentSession.id;
if(!sessionId){
  return sendError(res, "Missing SessionId", HTTP_STATUS.CONFLICT);
}
if(!currentSession.startMonth){
  return sendError(res, "StartMonth don't exist", HTTP_STATUS.CONFLICT);
}
const sessionStart = new Date(currentSession?.startMonth?.startDate);
const selectedDueDate = new Date(dueDate);
console.log("time ", sessionStart, selectedDueDate);
// Add 1 hour (3600000 ms) to session start
const minDueDate = new Date(sessionStart.getTime() + 3600 * 1000);

if (selectedDueDate <= minDueDate) {
  return sendError(
    res,
    "Due date should be at least 1 hour after the session's start month",
    HTTP_STATUS.CONFLICT
  );
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
        lateFees:defaultLateFees,
        paymentType,
        installements,
        dueDate:new Date(dueDate)
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
    const { branchId, sessionId, classLabel } = req.query;
    const where: any = {};
    let classLabelId: string | null = null;

    // -------- Resolve classLabelId --------
    if (classLabel && branchId) {
      const classLabelExist = await prisma.classLabel.findFirst({
        where: { branchId, name: classLabel as string },
      });
      if (classLabelExist) {
        classLabelId = classLabelExist.id;
      }
    }

    if (branchId) where.branchId = branchId;
    if (sessionId) where.sessionId = sessionId;
    if (classLabelId) where.classLabelId = classLabelId;

    // -------- Fetch templates with discounts + policy --------
    const templates = await prisma.feeTemplate.findMany({
      where,
      include: {
        classLabel: true,
        feeHead:true,
        discounts: {
          include: { policy: true },
        },
      },
    });

    // -------- Map response --------
    const feeTemplates = templates.map((t) => {
      const totalDiscount = t.discounts.reduce(
        (sum, d) => sum + (d.appliedAmount ?? 0),
        0
      );

      return {
        id: t.id,
        feeHeadName: t.feeHead.name,
        sessionId: t.sessionId,
        branchId: t.branchId,
        classLabelId: t.classLabelId,
        classLabel: t.classLabel?.name || null,
        totalAmount: t.amount,
        finalAmount: t.amount - totalDiscount,
        discounts: t.discounts.map((d) => ({
          id: d.id,
          appliedAmount: d.appliedAmount,
          policyId: d.policyId,
          policyName: d.policy?.name ?? null
        })),
      };
    });

    return res
      .status(HTTP_STATUS.OK)
      .json({
        success: true,
        message: "FeeTemplates fetched",
        data: { feeTemplates },
      });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};


export const updateFeeTemplate = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    // Basic validation: cannot set negative totalAmount if provided
    if (payload.amount != null && (typeof payload.amount !== "number" || payload.amount <= 0)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "amount must be positive" });
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
    const { sectionId, classLabelId, branchId } = req.body;
    if (!classLabelId || !branchId) return sendError(res, "classId & branchId required", HTTP_STATUS.BAD_REQUEST);

    const classExist = await prisma.class.findFirst({
      where: { classLabelId, sectionId, branchId },
    });
    if (!classExist) {
      return sendError(res, "Class doesn't exist", HTTP_STATUS.CONFLICT);
    }
    const classId = classExist.id;
    const sessionExist = await prisma.academicSession.findFirst({where:{branchId, isCurrent:true}, include:{months:true}});
    if(!sessionExist){
      return sendError(res, "Session don't exist", HTTP_STATUS.CONFLICT);
    }
    const sessionId = sessionExist.id;
    const monthsInSession = sessionExist.months.length;
    // use transaction - if any creation fails, rollback
    const result = await prisma.$transaction(async (tx) => {
      // find students and templates
      const enrollments = await tx.enrollment.findMany({ where: { classId, sessionId } });
      const templates = await tx.feeTemplate.findMany({ where: { classLabelId, sessionId }, include:{feeHead:true, discounts:true, lateFees:true} });

      if (enrollments.length === 0) throw new Error("No students found for this class & session");
      if (templates.length === 0) throw new Error("No fee templates found for this class & session");

      const created: any[] = [];
      for (const enrollment of enrollments) {
        for (const template of templates) {
          // avoid duplicates if same doc already exists
          const exists = await tx.feeDoc.findFirst({
            where: { enrollmentId: enrollment.id, templateId: template.id, feeHeadId: template.feeHeadId }
          });
          if (exists) {
            created.push({ skipped: true, enrollmentId: enrollment.id, templateId: template.id });
            continue;
          }
          const discounts = template.discounts;
          const lateFees = template.lateFees;
          let totalDiscountAmt = 0;
          for(const discount of discounts){
            totalDiscountAmt+=discount.appliedAmount;
          }
          const doc = await tx.feeDoc.create({
            data: {
              enrollmentId: enrollment.id,
              feeHeadId: template.feeHeadId,
              templateId: template.id,
              amount: template.amount ?? template.amount, // adjust field names if needed
              afterAmount:template.amount-totalDiscountAmt,
              status: "PENDING",
              paymentType:template.paymentType
            }
          });
          for(const discount of discounts){
            await tx.discount.create({data:{appliedAmount:discount.appliedAmount, feeDocId:doc.id, feeTemplateId:discount.feeTemplateId}});
          }
          for(const lateFee of lateFees){
            await tx.lateFee.create({data:{amount:lateFee.amount, feeDocId:doc.id, feeTemplateId:lateFee.feeTemplateId}});
          }
          created.push(doc);
          const dueDates = generateDueDates(template.paymentType, {dueDate:template.dueDate, months:monthsInSession, installments:(template.installements ?? 0)})
          // payment template main jo amount hain usko deduct krdo discount amount se utne ka payments create krdo
          await createPayment(tx, doc, doc.afterAmount, template.feeHead.name, template.paymentType, dueDates);
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

export const removeDiscountFromFeeDoc = async(req:any, res:any) => {
  const {feeDocId, discountId} = req.body;
  if(!feeDocId || !discountId){
    return sendError(res, "Required Fields", HTTP_STATUS.BAD_REQUEST);
  }
  const feeDoc = await prisma.feeDoc.findUnique({where:{id:feeDocId}, include:{payments:true}});
  const discount = await prisma.discount.findUnique({where:{id:discountId}});
  if(!feeDoc || !discount){
    return sendError(res, "wrong discount or feeDoc id", HTTP_STATUS.CONFLICT);
  }
  try {
    await prisma.$transaction(async (tx) => {
      const discountAmt = discount.appliedAmount;
      await tx.discount.delete({where:{id:discountId}});
      await tx.feeDoc.update({where:{id:feeDocId}, data:{afterAmount:feeDoc.afterAmount+discountAmt}});
      await updatePayments(tx, feeDocId, feeDoc.afterAmount, feeDoc.paymentType, feeDoc.payments);
    })
    const feeDocUpdated = await prisma.feeDoc.findUnique({where:{id:feeDocId}, include:{payments:true}});
    return sendSuccess(res, "removed discount successfully", feeDocUpdated, HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(res, (error as any).message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}


// -------------------- FeeDoc for Specific Students --------------------
export const generateFeeDocsForStudents = async (req: any, res: any) => {
  try {
    const { templateId, classLabelId:classLabel, branchId, studentIds } = req.body;


    if (!templateId || !branchId || !Array.isArray(studentIds) || studentIds.length === 0) {
      return sendError(res, "templateId, classLabelId, branchId and studentIds[] are required", HTTP_STATUS.BAD_REQUEST);
    }

    const classLabelExist = await prisma.classLabel.findFirst({where:{name:classLabel}});
    if(!classLabelExist){
      return sendError(res, "class name don't exist ", HTTP_STATUS.CONFLICT);
    }
    const classLabelId = classLabelExist.id;

    // Ensure session exists
    const sessionExist = await prisma.academicSession.findFirst({
      where: { branchId, isCurrent: true },
      include: { months: true },
    });
    if (!sessionExist) {
      return sendError(res, "Session doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const sessionId = sessionExist.id;
    const monthsInSession = sessionExist.months.length;

    const result = await prisma.$transaction(async (tx) => {
      // Get template with relations
      const template = await tx.feeTemplate.findFirst({
        where: { id: templateId, classLabelId, sessionId },
        include: { feeHead: true, discounts: true, lateFees: true },
      });
      if (!template) throw new Error("Template not found for given class & session");

      const created: any[] = [];

      for (const studentId of studentIds) {
        const enrollment = await tx.enrollment.findFirst({
          where: { studentId, sessionId },
        });
        if (!enrollment) {
          created.push({ skipped: true, reason: "No enrollment", studentId });
          continue;
        }

        // avoid duplicates
        const exists = await tx.feeDoc.findFirst({
          where: { enrollmentId: enrollment.id, templateId: template.id, feeHeadId: template.feeHeadId },
        });
        if (exists) {
          created.push({ skipped: true, reason: "Already exists", studentId });
          continue;
        }

        // Apply discounts
        let totalDiscountAmt = 0;
        for (const discount of template.discounts) {
          totalDiscountAmt += discount.appliedAmount;
        }

        // Create FeeDoc
        const doc = await tx.feeDoc.create({
          data: {
            enrollmentId: enrollment.id,
            feeHeadId: template.feeHeadId,
            templateId: template.id,
            amount: template.amount ?? 0,
            afterAmount: (template.amount ?? 0) - totalDiscountAmt,
            status: "PENDING",
            paymentType: template.paymentType,
          },
        });

        // Copy discounts
        for (const discount of template.discounts) {
          await tx.discount.create({
            data: {
              appliedAmount: discount.appliedAmount,
              feeDocId: doc.id,
              feeTemplateId: discount.feeTemplateId,
              policyId: discount.policyId ?? null,
            },
          });
        }

        // Copy late fees
        for (const lateFee of template.lateFees) {
          await tx.lateFee.create({
            data: {
              amount: lateFee.amount,
              feeDocId: doc.id,
              feeTemplateId: lateFee.feeTemplateId,
            },
          });
        }

        // Generate due dates for payments
        const dueDates = generateDueDates(template.paymentType, {
          dueDate: template.dueDate,
          months: monthsInSession,
          installments: template.installements ?? 0,
        });

        // Create fee payments
        await createPayment(
          tx,
          doc,
          doc.afterAmount,
          template.feeHead.name,
          template.paymentType,
          dueDates
        );

        created.push({ success: true, studentId, doc });
      }

      return created;
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "FeeDocs generated for students",
      data: { feeDocs: result },
    });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};


// for one student

export const generateFeeDocForStudent = async (req: any, res: any) => {
  try {
    const {
      classLabelId,
      sectionId,
      branchId,
      paymentType,
      dueDates,         // ✅ user passes array of dueDates
      studentId,
      templateId,
    } = req.body;

    if (!classLabelId || !branchId) {
      return sendError(res, "classId, sessionId & branchId required", HTTP_STATUS.BAD_REQUEST);
    }

    const sessionExist = await prisma.academicSession.findFirst({where:{branchId, isCurrent:true}, include:{months:true}});
    if(!sessionExist){
      return sendError(res, "Session don't exist", HTTP_STATUS.CONFLICT);
    }
    const sessionId = sessionExist.id;

    if (!Array.isArray(dueDates) || dueDates.length === 0) {
      return sendError(res, "dueDates array is required", HTTP_STATUS.BAD_REQUEST);
    }

    const classExist = await prisma.class.findFirst({
      where: { classLabelId, sectionId, branchId },
    });
    if (!classExist) {
      return sendError(res, "Class doesn't exist", HTTP_STATUS.CONFLICT);
    }
    const classId = classExist.id;

    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findFirst({
        where: { classId, sessionId, studentId },
      });
      const template = await tx.feeTemplate.findFirst({ where: { id: templateId }, include:{feeHead:true, discounts:true} });

      if (!enrollment) throw new Error("No student found for this class & session");
      if (!template) throw new Error("No fee template found");

      const exist = await tx.feeDoc.findFirst({
        where: { enrollmentId: enrollment.id, templateId },
      });
      if (exist) throw new Error("Template already exists for this student");

      const discounts = template.discounts;
      let totalDiscountAmt = 0;
      for(const discount of discounts){
        totalDiscountAmt+=discount.appliedAmount;
      }
      // ---------- Create FeeDoc ----------
      const doc = await tx.feeDoc.create({
        data: {
          enrollmentId: enrollment.id,
          feeHeadId: template.feeHeadId,
          templateId: template.id,
          amount: template.amount,
          afterAmount:template.amount-totalDiscountAmt,
          status: "PENDING",
          paymentType,
        },
      });

      // ---------- Generate Payments ----------
     await createPayment(tx, doc, doc.afterAmount, template.feeHead.name, paymentType, dueDates);

      return { doc };
    });

    return sendSuccess(res, "FeeDoc generated", result, HTTP_STATUS.CREATED);
  } catch (err: any) {
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};


export const getStudentFeeDocs = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "studentId required" });
    }

    const student = await prisma.student.findFirst({ where: { id: studentId } });
    if (!student) {
      return sendError(res, "Student doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const branchId = student.branchId;
    const currentSession = await prisma.academicSession.findFirst({
      where: { branchId, isCurrent: true },
    });
    if (!currentSession) {
      return sendError(res, "Session doesn't exist", HTTP_STATUS.CONFLICT);
    }
    const enrollment =  await getEnrollment({ studentId, sessionId: currentSession.id }, {});
    if (!enrollment) {
      return sendError(res, "Enrollment doesn't exist", HTTP_STATUS.CONFLICT);
    }

const feeDocs = await prisma.feeDoc.findMany({
  where: { enrollmentId: enrollment.id },
  include: {
    discounts: true,
    lateFees: true, // rules defined at FeeDoc level
    payments: {
      include: {
        lateFees: true, // applied late fees at payment level
        feeAllocations: {
          select: {
            allocatedAmount: true, // scalar field at this level
            transaction: {
              select: {
                id:true,
                amountPaid: true,
                paidOn: true,
                mode:true, 
                receiptNo:true,
                lateFees:{select:{amount:true}},
                discounts:{select:{appliedAmount:true}},
                createdBy: {
                  select:{name:true, id:true}
                },
              },
            },
          },
        },
      },
    },
    transactions: {
      include: { transaction: true },
    },
    feeHead: true,
  },
});

    const formattedDocs = feeDocs.map((doc) => {
      const discountTotalAmount = doc.discounts.reduce(
        (sum, d) => sum + d.appliedAmount,
        0
      );
      const totalLateFeeAmt = doc.lateFees.reduce((sum, lt)=> sum+lt.amount, 0);
      const currentDate = new Date();
      const afterAmount = doc.amount - discountTotalAmount;
      const payments = doc.payments.map((p) => ({
        id: p.id,
        name: p.name,
        dueDate: p.dueDate,
        amount: p.amount + (currentDate>new Date(p.dueDate) ? totalLateFeeAmt : p.fineAmount),
        isPaid: p.isPaid,
        paidAmount: p.paidAmount,
        fineAmount: currentDate>new Date(p.dueDate) ? totalLateFeeAmt : p.fineAmount, // only set when paid late
        discountAmt:discountTotalAmount/doc.payments.length,
        lateFees: p.lateFees.map((lf) => ({
          id: lf.id,
          amount: lf.amount,
          reason: lf.reason,
        })),
        transactions:p.feeAllocations.map(t=>t.transaction)
      }));

      return {
        id: doc.id,
        paymentType:doc.paymentType,
        feeHead: doc.feeHead,
        amount: doc.amount,
        discountTotalAmount,
        afterAmount,
        status: doc.status,
        discounts: doc.discounts,
        lateFeeRules: doc.lateFees, // rules, not applied fines
        payments,
      };
    });
    return sendSuccess(res, "Students Feedocs Fetched", {feeDocs:formattedDocs})
    // return res.status(HTTP_STATUS.OK).json({
    //   success: true,
    //   message: "Student FeeDocs fetched",
    //   data: { feeDocs: formattedDocs },
    // });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};


export const updateFeeDoc = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    if (!id) return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "id required" });

    // Validate sensible fields, e.g., amount must be positive if provided
    if (payload.amount != null && (typeof payload.amount !== "number" || payload.amount)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "amount can't be updated" });
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

export const getUnpaidFeePaymentAmount = async (req: any, res: any) => {
  try {
    const { studentId, branchId } = req.query;
    console.log("student details ", studentId)
    const createdById = req.user.id;

    if (!studentId || !createdById) {
      return sendError(res, "Missing Fields", HTTP_STATUS.BAD_REQUEST);
    }

    const currentSession = await prisma.academicSession.findFirst({
      where: { branchId, isCurrent: true },
    });

    if (!currentSession) {
      return sendError(res, "Session doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, sessionId: currentSession.id },
    });

    if (!enrollment) {
      return sendError(res, "Enrollment doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const enrollmentId = enrollment.id;

    // ✅ Get all fee docs with PARTIAL or PENDING status
    const feeDocs = await prisma.feeDoc.findMany({
      where: {
        enrollmentId,
        status: { in: [PaymentStatus.PARTIAL, PaymentStatus.PENDING] },
      },
    });

    let unpaidAmount: number = 0;

    // ✅ Use for...of for async/await
    for (const feeDoc of feeDocs) {
      const paymentAmount = await prisma.feePayment.aggregate({
        _sum: { amount: true, paidAmount:true },
        where: { feeDocId: feeDoc.id, isPaid: false },
      });

      unpaidAmount += ((paymentAmount._sum.amount||0) - (paymentAmount._sum.paidAmount||0));
    }
    return sendSuccess(res, "Success", {unpaidAmount}, HTTP_STATUS.OK)
  } catch (error) {
    console.error(error);
    return sendError(res, "Internal server error", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};


// -------------------- FeeTransaction --------------------
/**
 * createTransaction:
 * - Validates input
 * - Finds due feePayments for the student ordered by dueDate (oldest first)
 * - Allocates payment amount sequentially to due payments (partial if needed)
 * - Creates a feeTransaction and feeTransactionItems atomically
 */


export const createTransaction = async (req: any, res: any) => {
  try {
    const { studentId, amount, mode, referenceId, remarks, branchId, lateFee, lateFeeReason, discountAmount } = req.body;
    const createdById = req.user.id;

    if (!studentId || !amount || !mode || !createdById) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Missing fields" });
    }
    const currentSession = await prisma.academicSession.findFirst({
      where: { branchId, isCurrent: true },
    });
    if (!currentSession) {
      return sendError(res, "Session doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, sessionId: currentSession.id },
    });
    if (!enrollment) {
      return sendError(res, "Enrollment doesn't exist", HTTP_STATUS.CONFLICT);
    }

    const enrollmentId = enrollment.id;

    // Run everything atomically
    const result = await prisma.$transaction(async (tx) => {

      let currentAppliedLateFee = null;
      let currentAppliedDiscount = null;
      if(lateFee){
        currentAppliedLateFee = await tx.lateFee.create({data:{amount:parseFloat(lateFee), reason:lateFeeReason}});
      }
      if(discountAmount){
        currentAppliedDiscount = await tx.discount.create({data:{appliedAmount:parseFloat(discountAmount)}});
      }

      let remaining = amount 

      // fetch unpaid payments
      const duePayments = await tx.feePayment.findMany({
        where: { feeDoc: { enrollmentId }, isPaid: false },
        orderBy: { dueDate: "asc" }, include:{lateFees:true}
      });
      if(duePayments.length===0){
        return sendError(res, "User Payments are cleared", HTTP_STATUS.BAD_REQUEST);
      }
      const allocations: { feePaymentId: string; amount: number; feeDocId: string, fineAmount:number }[] = [];
      const currentDate = new Date();
      for (const payment of duePayments) {
        if (remaining <= 0) break;
        const lateFeesOfCurrentFeeDoc = await tx.lateFee.findMany({where:{feeDocId:payment.feeDocId}});
        const alreadyAppliedLateFees =  payment.lateFees;
        const appliedIds = new Set(alreadyAppliedLateFees.map(f => f.id));
        const newLateFees = lateFeesOfCurrentFeeDoc.filter(fee => !appliedIds.has(fee.id));
        let totalLateFeeAmt = 0;
        for(const lateFee of newLateFees){
          totalLateFeeAmt += lateFee.amount;
        }
        const alreadyPaid = payment.paidAmount || 0;
        let toPay = Math.min(remaining, payment.amount - alreadyPaid);
        const dueDate = new Date(payment.dueDate);
        // due date ke baad late fee add ho jayega jitna dena hain usme
        if(dueDate<currentDate){
          toPay+=totalLateFeeAmt;
          await tx.feePayment.update({where:{id:payment.id}, data:{fineAmount:totalLateFeeAmt, lateFees:{set: newLateFees.map(fee => ({ id: fee.id }))}}})
          // late fee apply ho rhi hain to usko update kr rhe hain feedoc main as after amount 
          await tx.feeDoc.update({where:{id:payment.feeDocId}, data:{afterAmount:{increment:totalLateFeeAmt}}})
        }
        remaining -= toPay;

        await tx.feePayment.update({
          where: { id: payment.id },
          data: {
            paidAmount: { increment: toPay },
            isPaid: alreadyPaid + toPay >= payment.amount + totalLateFeeAmt,
          },
        });
        // feeDoc main late fee nhi hain actual jo payment hain unko agr late deposite kiya to late fee lag rhi hain so no need to take fine amount outside fee payment
        allocations.push({ feePaymentId: payment.id, amount: toPay-totalLateFeeAmt, fineAmount:totalLateFeeAmt, feeDocId: payment.feeDocId });
      }

      const receiptNo = `RCPT-${Date.now()}`;

      const txn = await tx.feeTransaction.create({
        data: {
          enrollmentId,
          amountPaid: amount,
          returnedAmt:remaining,
          mode,
          referenceId,
          remarks,
          receiptNo,
          createdById,
        },
      });
      if(currentAppliedLateFee){
        await tx.lateFee.update({where:{id:currentAppliedLateFee.id}, data:{transactionId:txn.id}});
      }
      if(currentAppliedDiscount){
        await tx.discount.update({where:{id:currentAppliedDiscount.id}, data:{transactionId:txn.id}});
      }
      // Create or update feeTransactionItems
     for (const alloc of allocations) {
        const feeDoc = await tx.feeDoc.findUnique({
        where: { id: alloc.feeDocId },
      });
      // create feePaymentAllocation-> to track which transaction cleared which payment
      await tx.feePaymentAllocation.create({data:{feePaymentId:alloc.feePaymentId, transactionId:txn.id, allocatedAmount:alloc.amount+alloc.fineAmount}})


  if (!feeDoc) continue;

  let feeTxnItm = await tx.feeTransactionItem.findFirst({
    where: { feeDocId: alloc.feeDocId, transactionId: txn.id },
  });

  if (feeTxnItm) {
    feeTxnItm = await tx.feeTransactionItem.update({
      where: { id: feeTxnItm.id },
      data: { paidAmount: { increment: alloc.amount } },
    });
  } else {
    feeTxnItm = await tx.feeTransactionItem.create({
      data: {
        transactionId: txn.id,
        feeDocId: alloc.feeDocId,
        paidAmount: alloc.amount,
      },
    });
  }

  // 🔑 Sum of all payments across all transactions for this feeDoc
  const totalPaid = await tx.feeTransactionItem.aggregate({
    where: { feeDocId: alloc.feeDocId },
    _sum: { paidAmount: true },
  });

  const paidSoFar = totalPaid._sum.paidAmount || 0;

  await tx.feeDoc.update({
    where: { id: alloc.feeDocId },
    data: {
      status: paidSoFar < (feeDoc.afterAmount || 0) ? "PARTIAL" : "PAID",
    },
  });
}


      return txn;
    });

    return res.json({ success: true, message: "Transaction created", data: { txn: result } });
  } catch (err: any) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};

export const payForFeePayment = async (req: any, res: any) => {
  try {
    const { paymentId, amount, mode, referenceId, remarks } = req.body;
    const createdById = req.user.id;

    if (!paymentId || !amount || !mode || !createdById) {
      return sendError(
        res,
        "paymentId, amount, mode, createdById are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      return processFeePayment(
        tx,
        paymentId,
        amount,
        mode,
        referenceId,
        remarks,
        createdById
      );
    });

    return sendSuccess(res, "Payment recorded successfully", result);
  } catch (err: any) {
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

export const payForMultipleFeePayments = async (req: any, res: any) => {
  try {
    const { payments } = req.body; 
    // payments = [{ paymentId, amount, mode, referenceId, remarks }, ...]

    const createdById = req.user.id;
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return sendError(res, "Payments array required", HTTP_STATUS.BAD_REQUEST);
    }

    const results = await prisma.$transaction(async (tx) => {
      const responses = [];
      for (const p of payments) {
        if (!p.paymentId || !p.amount || !p.mode) {
          throw new Error("Each payment requires paymentId, amount, mode");
        }
        const result = await processFeePayment(
          tx,
          p.paymentId,
          p.amount,
          p.mode,
          p.referenceId || null,
          p.remarks || null,
          createdById
        );
        responses.push(result);
      }
      return responses;
    });

    return sendSuccess(res, "Multiple payments recorded successfully", results);
  } catch (err: any) {
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

// review krna hain
export const revertPaymentForFeePayment = async (req: any, res: any) => {
  try {
    const { transactionId, feePaymentId } = req.body;

    if (!transactionId || !feePaymentId) {
      return sendError(res, "transactionId and feePaymentId are required", HTTP_STATUS.BAD_REQUEST);
    }

    const txnItem = await prisma.feeTransactionItem.findFirst({
      where: { transactionId, feeDoc: { payments: { some: { id: feePaymentId } } } },
      include: {
        feeDoc: { include: { payments: true } },
      },
    });

    if (!txnItem) {
      return sendError(res, "No matching FeeTransactionItem found", HTTP_STATUS.NOT_FOUND);
    }

    const feePayment = await prisma.feePayment.findUnique({ where: { id: feePaymentId } });
    if (!feePayment) {
      return sendError(res, "FeePayment not found", HTTP_STATUS.NOT_FOUND);
    }

    // Wrap in transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Rollback paidAmount from FeePayment
      const updatedPayment = await tx.feePayment.update({
        where: { id: feePaymentId },
        data: {
          paidAmount: { decrement: txnItem.paidAmount },
          isPaid: false,
        },
      });

      // 2. Update FeeDoc status (check if any payment is still paid)
      const doc = await tx.feeDoc.update({
        where: { id: txnItem.feeDocId },
        data: {
          status: updatedPayment.paidAmount > 0 ? "PARTIAL" : "PENDING",
        },
      });

      // 3. Delete transactionItem
      await tx.feeTransactionItem.delete({ where: { id: txnItem.id } });

      // 4. If no items left for this transaction → delete transaction too
      const remainingItems = await tx.feeTransactionItem.count({
        where: { transactionId },
      });
      if (remainingItems === 0) {
        await tx.feeTransaction.delete({ where: { id: transactionId } });
      }

      return { updatedPayment, doc };
    });

    return sendSuccess(res, "Payment reverted successfully", result);
  } catch (err: any) {
    console.error(err);
    return sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};


/*
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