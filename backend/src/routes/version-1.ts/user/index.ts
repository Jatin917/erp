import { Router } from "express";
import { changePassword, login, registerUser, userExist } from "@src/controllers/school/persons/index.js";
import { emailVerificationSignController, emailVerificationVerifyController, sendOtpEmailSignController, sendOtpEmailVerifyController } from "@src/controllers/auth/otp.js";
import { permitPermission } from "@src/controllers/user/index.js";
import { isPermitted } from "@src/middlewares/permission/index.js";
import { TokenCheck } from "@src/middlewares/auth/token.js";

export const userRouter = Router();

userRouter.post("/register-user",  TokenCheck, isPermitted,  registerUser);
userRouter.post("/login", login);
userRouter.patch("/change-password", TokenCheck, changePassword);
userRouter.post("/signin-send-otp", sendOtpEmailSignController);
userRouter.post("/signin-verify-otp", emailVerificationSignController);
userRouter.post("/verify-send-otp", TokenCheck, sendOtpEmailVerifyController);
userRouter.post("/verify-verify-otp", TokenCheck, emailVerificationVerifyController);
userRouter.post("/assign-permission", TokenCheck, isPermitted, permitPermission)
userRouter.get("/exists", TokenCheck, userExist);
