import { OTP_TYPE } from '@src/lib/types.js';
export declare function storeOtp(email: string, otp: number, type: OTP_TYPE): Promise<void>;
export declare function verifyOtp(email: string, otp: number, type: OTP_TYPE): Promise<boolean>;
export declare function isEmailVerified(email: string, type: OTP_TYPE): Promise<string | false>;
export declare const sendOtpEmailFunction: (email: string, type: OTP_TYPE) => Promise<{
    success: boolean;
    message: any;
}>;
export declare const emailVerification: (otp: string, email: string, type: OTP_TYPE) => Promise<{
    success: boolean;
    message: string;
}>;
//# sourceMappingURL=otp.d.ts.map