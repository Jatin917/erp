import { Router } from "express";
import { changePassword, registerUser } from "../../../controllers/school/persons/index.js";
import { emailVerificationController, sendOtpEmailController } from "../../../controllers/auth/otp.js";
import { permitPermission } from "../../../controllers/user/index.js";
export const userRouter = Router();
userRouter.post("/register-user", registerUser);
userRouter.patch("/change-password", changePassword);
userRouter.post("/send-otp", sendOtpEmailController);
userRouter.post("/verify-otp", emailVerificationController);
userRouter.post("/assign-permission", permitPermission);
//# sourceMappingURL=index.js.map