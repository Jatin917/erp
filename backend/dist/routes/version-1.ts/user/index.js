import { Router } from "express";
import { changePassword, login, registerUser, userExist } from "@src/controllers/school/persons/index.js";
import { emailVerificationSignController, emailVerificationVerifyController, sendOtpEmailSignController, sendOtpEmailVerifyController } from "@src/controllers/auth/otp.js";
import { permitPermission } from "@src/controllers/user/index.js";
import { isPermitted } from "@src/middlewares/permission/index.js";
export const userRouter = Router();
userRouter.post("/register-user", isPermitted, registerUser);
userRouter.post("/login", login);
userRouter.patch("/change-password", changePassword);
userRouter.post("/signin-send-otp", sendOtpEmailSignController);
userRouter.post("/signin-verify-otp", emailVerificationSignController);
userRouter.post("/verify-send-otp", sendOtpEmailVerifyController);
userRouter.post("/verify-verify-otp", emailVerificationVerifyController);
userRouter.post("/assign-permission", isPermitted, permitPermission);
userRouter.get("/exists", userExist);
//# sourceMappingURL=index.js.map