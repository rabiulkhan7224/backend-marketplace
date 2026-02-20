
import { z } from 'zod';

export const createRequestSchema = z.object({
  // No body needed — solverId from token, projectId from param
});

export const respondRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});