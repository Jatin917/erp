import Router from 'express'
import { schoolRouter } from './school/index.js';
import { userRouter } from './user/index.js';
import { studentRouter } from './studentRouter/studentRouter.js';
import { TokenCheck } from '@src/middlewares/auth/token.js';
import { requireBranchAccess } from '@src/middlewares/branch-access/index.js';
import { feeModuleRouter } from './feeModuleRouter/feeModuleRouter.js';
import { attendanceModuleRouter } from './attendanceModuleRouter/attendanceModuleRouter.js';
import { reportsRouter } from './reports/index.js';
import { templatesRouter } from './templates/index.js';

export const router_v1 = Router();
router_v1.use("/school", TokenCheck, requireBranchAccess, schoolRouter);
router_v1.use("/auth", userRouter);
router_v1.use("/student", TokenCheck, requireBranchAccess, studentRouter);
router_v1.use("/fee", TokenCheck, requireBranchAccess, feeModuleRouter);
router_v1.use("/attendance", TokenCheck, requireBranchAccess, attendanceModuleRouter);
router_v1.use("/reports", TokenCheck, requireBranchAccess, reportsRouter);
router_v1.use("/templates", TokenCheck, requireBranchAccess, templatesRouter);
