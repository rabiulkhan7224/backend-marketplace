// middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/error';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, config.jwt_access_token_secret) as { id: string; role: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    throw new AppError('Invalid token', 401);
  }
};