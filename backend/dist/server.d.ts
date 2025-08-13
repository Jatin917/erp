import { PrismaClient } from '../generated/prisma/index.js';
export declare const otpStorage: Map<string, {
    otp: number;
    expiresAt: number;
}>;
export declare const emailVerified: Map<string, {
    isVerified: boolean;
    expiresAt: number;
}>;
export declare const prisma: PrismaClient<import("../generated/prisma/index.js").Prisma.PrismaClientOptions, never, import("../generated/prisma/runtime/library.js").DefaultArgs>;
//# sourceMappingURL=server.d.ts.map