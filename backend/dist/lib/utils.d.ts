import type { Response } from "express";
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, status?: number) => Response<any, Record<string, any>>;
export declare const sendError: (res: Response, message: string, status?: number) => Response<any, Record<string, any>>;
//# sourceMappingURL=utils.d.ts.map