import Router from 'express';
import { schoolRouter } from './school/index.js';
import { userRouter } from './user/index.js';
export const router_v1 = Router();
router_v1.use("/school", schoolRouter);
router_v1.use("/auth", userRouter);
//# sourceMappingURL=route.js.map