import Router from 'express';
import { schoolRouter } from './school/index.js';
import { userRouter } from './user/index.js';
import { studentRouter } from './studentRouter/studentRouter.js';
import { TokenCheck } from '../../middlewares/auth/token.js';
import { feeModuleRouter } from './feeModuleRouter/feeModuleRouter.js';
import { attendanceModuleRouter } from './attendanceModuleRouter/attendanceModuleRouter.js';
import { reportsRouter } from './reports/index.js';
export const router_v1 = Router();
router_v1.use("/school", TokenCheck, schoolRouter);
router_v1.use("/auth", userRouter);
router_v1.use("/student", TokenCheck, studentRouter);
router_v1.use("/fee", feeModuleRouter);
router_v1.use("/attendance", TokenCheck, attendanceModuleRouter);
router_v1.use("/reports", TokenCheck, reportsRouter);
//# sourceMappingURL=route.js.map