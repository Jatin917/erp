import type { NextFunction, Response } from "express";
import { Permission } from "../../../generated/prisma/index.js";
type PermissionValue = Permission | typeof Permission.ALL;
export declare const requirePermission: (permission: PermissionValue) => (req: any, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireAnyPermission: (...required: PermissionValue[]) => (req: any, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=index.d.ts.map