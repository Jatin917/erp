import { Router } from "express";
import { isPermitted } from "@src/middlewares/permission/index.js";
import multer from "multer";
import { createFeeHead, createFeeTemplate, createTransaction, deleteFeeHead, deleteFeeTemplate, feeRecieptForTransaction, generateFeeDocs, generateFeeDocsForStudents, getFeeTemplates, getStudentFeeDocs, getUnpaidFeePaymentAmount, listFeeHeads, payForFeePayment, payForMultipleFeePayments, removeDiscountFromFeeDoc, revertPaymentForFeePayment, updateFeeHead, updateFeeTemplate } from "@src/controllers/school/fees/fees.js";
import { applyDiscount, createDiscountPolicy, createLateFee, deleteAppliedDiscount, deleteDiscountPolicy, deleteLateFee, getDiscountsById, listDiscountPolicies, updateDiscountPolicy, updateLateFee } from "../discounts/index.js";

export const feeModuleRouter = Router();


const upload = multer({ dest: "uploads/" });



feeModuleRouter.post('/create-feehead', isPermitted, createFeeHead);
feeModuleRouter.get('/list-feeheads', isPermitted, listFeeHeads);
feeModuleRouter.put('/update-feehead/:id', isPermitted, updateFeeHead);
feeModuleRouter.delete('/delete-feehead/:id', isPermitted, deleteFeeHead);
feeModuleRouter.post('/create-feetemplate', isPermitted, createFeeTemplate);
feeModuleRouter.get('/list-feetemplate', isPermitted, getFeeTemplates);
feeModuleRouter.put('/update-feetemplate/:id', isPermitted, updateFeeTemplate);
feeModuleRouter.delete('/delete-feetemplate/:id', isPermitted, deleteFeeTemplate);
feeModuleRouter.post('/create-discountpolicy', isPermitted, createDiscountPolicy);
feeModuleRouter.get('/list-discountpolicy/:branchId', isPermitted, listDiscountPolicies);
feeModuleRouter.put('/update-discountpolicy/:id', isPermitted, updateDiscountPolicy);  
feeModuleRouter.delete('/delete-discountpolicy/:id', isPermitted, deleteDiscountPolicy);  
feeModuleRouter.delete('/delete-applied-discount/:id', isPermitted, deleteAppliedDiscount);  
feeModuleRouter.post('/apply-discount', isPermitted, applyDiscount);
feeModuleRouter.get('/list-discount-by-id', isPermitted, getDiscountsById); 


// Late Fee
feeModuleRouter.post("/create-latefee", isPermitted, createLateFee); 
feeModuleRouter.put("/update-latefee/:id", isPermitted, updateLateFee);
feeModuleRouter.delete("/delete-latefee/:id", isPermitted, deleteLateFee);


feeModuleRouter.post('/create-feedocs', isPermitted, generateFeeDocs);
feeModuleRouter.post('/create-students-feedoc', isPermitted, generateFeeDocsForStudents);
feeModuleRouter.get('/list-feedocs/:studentId', isPermitted, getStudentFeeDocs);
// feeModuleRouter.get('/update-feedoc', isPermitted, updateFeeDoc);
// feeModuleRouter.get('/create-feepayment', isPermitted, addFeePayment);
// feeModuleRouter.get('/list-feepayments', isPermitted, getFeePayments);
// feeModuleRouter.get('/update-feepayment', isPermitted, updateFeePayment);
feeModuleRouter.post('/create-transaction', isPermitted, createTransaction);
feeModuleRouter.get("/get-unpaid-amounts", isPermitted, getUnpaidFeePaymentAmount);
feeModuleRouter.delete("/remove-discount-from-fee-doc", isPermitted, removeDiscountFromFeeDoc);
feeModuleRouter.post("/payByPaymentId", isPermitted, payForFeePayment);
feeModuleRouter.post("/collectMultiplePayments", isPermitted, payForMultipleFeePayments);
feeModuleRouter.put("/revert-payment", isPermitted, revertPaymentForFeePayment);
feeModuleRouter.get("/fee-reciept-transaction", feeRecieptForTransaction);
// feeModuleRouter.get('/list-student-transaction', isPermitted, getStudentTransactions);
// feeModuleRouter.get('/list-branch-transaction', isPermitted, getBranchTransactions);


