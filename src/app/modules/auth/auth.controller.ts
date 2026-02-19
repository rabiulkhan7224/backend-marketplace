import { registerSchema } from "./schemas";
import * as authService from './auth.service';
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

export const register = catchAsync(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.register(data);
 sendResponse(res, {
    status: 201,
    success: true,
    message: 'User registered successfully',
    data: result
  });
});