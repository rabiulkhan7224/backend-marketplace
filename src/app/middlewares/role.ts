import { Request, Response, NextFunction } from 'express';
import AppError from '../errors/error';

/**
 * Role-based access control middleware
 * Usage: roleMiddleware(['ADMIN', 'BUYER']) or roleMiddleware(['SOLVER'])
 *
 * @param allowedRoles - Array of roles that are permitted
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    // Ensure user is authenticated first (authMiddleware should run before)
    if (!user || !user.role) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if user's role is in allowed list
    if (!allowedRoles.includes(user.role)) {
      return next(
        new AppError(
          `Forbidden: Required role(s): ${allowedRoles.join(', ')}. Your role: ${user.role}`,
          403
        )
      );
    }

    next();
  };
};