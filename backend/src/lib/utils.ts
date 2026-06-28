// utils/response.ts
import type { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data?: T;
};

type ErrorResponse = {
  success: false;
  message: string;
};

export const sendSuccess = <T>(res: Response, message: string, data?: T, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...((data) ? { data } : {}),
  } as SuccessResponse<T>);
};

export const sendError = (res: Response, message: string, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  } as ErrorResponse);
};
