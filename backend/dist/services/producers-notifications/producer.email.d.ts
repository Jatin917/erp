import type { Role } from '../../../generated/prisma/index.js';
export declare const sendWelcomeEmail: (user: {
    email: string;
    name: string;
    password: string;
    roles: Role[];
}) => Promise<void>;
//# sourceMappingURL=producer.email.d.ts.map