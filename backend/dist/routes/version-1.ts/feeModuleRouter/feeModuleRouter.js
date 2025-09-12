import { Router } from "express";
import { isPermitted } from "../../../middlewares/permission/index.js";
import multer from "multer";
// import { addFeePayment, createFeeHead, createFeeTemplate, createTransaction, deleteFeeHead, deleteFeeTemplate, generateFeeDocs, getBranchTransactions, getFeePayments, getFeeTemplates, getStudentFeeDocs, getStudentTransactions, listFeeHeads, updateFeeDoc, updateFeeHead, updateFeePayment, updateFeeTemplate } from "../../../controllers/school/fees/fees.js";
export const feeModuleRouter = Router();
/*

const upload = multer({ dest: "uploads/" });



feeModuleRouter.post('/create-feehead', isPermitted, createFeeHead);
feeModuleRouter.get('/list-feeheads', isPermitted, listFeeHeads);
feeModuleRouter.get('/update-feeheads', isPermitted, updateFeeHead);
feeModuleRouter.get('/delete-feeheads', isPermitted, deleteFeeHead);
feeModuleRouter.get('/create-feetemplate', isPermitted, createFeeTemplate);
feeModuleRouter.get('/list-feetemplate', isPermitted, getFeeTemplates);
feeModuleRouter.get('/update-feetemplate', isPermitted, updateFeeTemplate);
feeModuleRouter.get('/delete-feetemplate', isPermitted, deleteFeeTemplate);
feeModuleRouter.get('/delete-feetemplate', isPermitted, deleteFeeTemplate);
feeModuleRouter.get('/delete-feetemplate', isPermitted, deleteFeeTemplate);
feeModuleRouter.get('/delete-feetemplate', isPermitted, deleteFeeTemplate);
feeModuleRouter.get('/delete-feetemplate', isPermitted, deleteFeeTemplate);
feeModuleRouter.get('/create-feedoc', isPermitted, generateFeeDocs);
feeModuleRouter.get('/update-feedoc', isPermitted, updateFeeDoc);
feeModuleRouter.get('/list-feedocs', isPermitted, getStudentFeeDocs);
feeModuleRouter.get('/create-feepayment', isPermitted, addFeePayment);
feeModuleRouter.get('/list-feepayments', isPermitted, getFeePayments);
feeModuleRouter.get('/update-feepayment', isPermitted, updateFeePayment);
feeModuleRouter.get('/create-transaction', isPermitted, createTransaction);
feeModuleRouter.get('/list-student-transaction', isPermitted, getStudentTransactions);
feeModuleRouter.get('/list-branch-transaction', isPermitted, getBranchTransactions);
*/
//# sourceMappingURL=feeModuleRouter.js.map