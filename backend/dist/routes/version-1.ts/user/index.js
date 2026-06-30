import { Router } from "express";
import { Permission } from "../../../../generated/prisma/index.js";
import { emailVerificationSignController, emailVerificationVerifyController, sendOtpEmailSignController, sendOtpEmailVerifyController, } from "@src/controllers/auth/otp.js";
import { changePassword, login, registerUser, userExist } from "@src/controllers/school/persons/index.js";
import { getUserPermissions, permitPermission } from "@src/controllers/user/index.js";
import { TokenCheck } from "@src/middlewares/auth/token.js";
import { requireAnyPermission, requirePermission } from "@src/middlewares/permission/index.js";
export const userRouter = Router();
userRouter.post("/register-user", TokenCheck, requirePermission(Permission.ALL), registerUser);
userRouter.post("/login", login);
userRouter.patch("/change-password", TokenCheck, changePassword);
userRouter.post("/signin-send-otp", sendOtpEmailSignController);
userRouter.post("/signin-verify-otp", emailVerificationSignController);
userRouter.post("/verify-send-otp", TokenCheck, sendOtpEmailVerifyController);
userRouter.post("/verify-verify-otp", TokenCheck, emailVerificationVerifyController);
userRouter.post("/assign-permission", TokenCheck, requireAnyPermission(Permission.ALL, Permission.ASSIGN_PERMISSION), permitPermission);
userRouter.get("/user-permissions/:userId", TokenCheck, requireAnyPermission(Permission.ALL, Permission.ASSIGN_PERMISSION), getUserPermissions);
userRouter.get("/exists", TokenCheck, userExist);
//# sourceMappingURL=index.js.map