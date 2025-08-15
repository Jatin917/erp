import { PrismaClient } from '../generated/prisma/index.js';
export declare const JWT_SECRET: string;
export declare const SUPERADMIN_EMAIL: string | undefined;
export declare const SUPERADMIN_PASSWORD: string | undefined;
export declare const otpStorage: Map<string, {
    otp: number;
    expiresAt: number;
}>;
export declare const emailVerified: Map<string, {
    isVerified: boolean;
    expiresAt: number;
}>;
export declare const defaultPassword: string;
export declare const prisma: PrismaClient<import("../generated/prisma/index.js").Prisma.PrismaClientOptions, never, import("../generated/prisma/runtime/library.js").DefaultArgs>;
//# sourceMappingURL=server.d.ts.map