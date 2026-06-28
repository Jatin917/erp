import { Console } from 'console';
import { HTTP_STATUS } from '../../lib/http-codes.js';
import {defaultPassword, prisma} from '../../server.js'
import { sendError, sendSuccess } from '@src/lib/utils.js';
import bcrypt from "bcrypt"
import { findOrCreateUser } from '@src/services/user/index.js';
import { isEmailVerified } from '@src/services/otp.js';
import { OTP_TYPE } from '@src/lib/types.js';

export const permitPermission = async (req:any, res:any) => {
  try {
    const { permissionToWhomId, permissionsToAllow, permissionsToDeny } = req.body;
    if (!permissionToWhomId) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "User ID is required" });
    }

    // Fetch the current user permissions
    const user = await prisma.user.findUnique({
      where: { id: permissionToWhomId },
      select: { permissions: true }
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "User not found" });
    }

    // Normalize arrays (avoid undefined/null values)
    const allowSet = Array.isArray(permissionsToAllow) ? permissionsToAllow.filter(Boolean) : [];
    const denySet = Array.isArray(permissionsToDeny) ? permissionsToDeny.filter(Boolean) : [];

    // Step 1: Merge allowed permissions
    let updatedPermissions = new Set(user.permissions || []);
    allowSet.forEach((p) => updatedPermissions.add(p));

    // Step 2: Remove denied permissions
    denySet.forEach((p) => updatedPermissions.delete(p));

    // Step 3: Update user in DB
    await prisma.user.update({
      where: { id: permissionToWhomId },
      data: {
        permissions: {
          set: Array.from(updatedPermissions)
        }
      }
    });

    return res.json({
      success: true,
      message: "Permissions updated successfully"
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
  }
};
