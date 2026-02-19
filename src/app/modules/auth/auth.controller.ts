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

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User logged in successfully',
    data: { token: result.token, user: result.user }
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await authService.getMe(userId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: result
  });
});