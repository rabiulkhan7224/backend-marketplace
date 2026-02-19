import { JwtPayload } from 'jsonwebtoken';

/**
 * Global declaration extending Express Request interface
 * Adds a 'user' property to the Request object when authentication is enabled
 */

export interface IUserPayload extends JwtPayload {
  user_id: string;
  role: string;
  iat?: number;
}

declare global {
  namespace Express {
    interface Request {
      /** JWT payload containing user information */
      user?: IUserPayload;
    }
  }
}

// Export the extended Request type for convenience
export type AuthenticatedRequest = Express.Request & {
  user: IUserPayload;
};
