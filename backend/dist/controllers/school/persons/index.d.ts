type RoleKey = 'SUPERADMIN' | 'DIRECTOR' | 'PRINCIPAL' | 'TEACHER' | 'LIBRARIAN' | 'RECEPTIONIST' | 'ACCOUNTANT' | 'SCHOOL_ADMIN' | 'STUDENT' | 'FATHER' | "MOTHER";
import type { Request, Response } from "express";
export declare const registerUser: (req: Request<{}, // params
{}, // response body
{
    name: string;
    email: string;
    password: string;
    phone: string;
    role: RoleKey;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changePassword: (req: any, res: any) => Promise<any>;
export declare const login: (req: any, res: any) => Promise<any>;
export declare const userExist: (req: any, res: any) => Promise<any>;
export {};
//# sourceMappingURL=index.d.ts.map