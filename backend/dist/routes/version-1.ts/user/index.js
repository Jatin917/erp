import { Router } from "express";
import { changePassword, login, registerUser } from "../../../controllers/school/persons/index.js";
import { emailVerificationController, sendOtpEmailController } from "../../../controllers/auth/otp.js";
import { permitPermission } from "../../../controllers/user/index.js";
import { isPermitted } from "../../../middlewares/permission/index.js";
export const userRouter = Router();
userRouter.post("/register-user", isPermitted, registerUser);
userRouter.post("/login", login);
userRouter.patch("/change-password", changePassword);
userRouter.post("/send-otp", sendOtpEmailController);
userRouter.post("/verify-otp", emailVerificationController);
userRouter.post("/assign-permission", isPermitted, permitPermission);
//# sourceMappingURL=index.js.map