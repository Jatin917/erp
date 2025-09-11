import Router from 'express';
import { schoolRouter } from './school/index.js';
import { userRouter } from './user/index.js';
import { studentRouter } from './studentRouter/studentRouter.js';
import { TokenCheck } from '../../middlewares/auth/token.js';
export const router_v1 = Router();
router_v1.use("/school", TokenCheck, schoolRouter);
router_v1.use("/auth", userRouter);
router_v1.use("/student", TokenCheck, studentRouter);
//# sourceMappingURL=route.js.map