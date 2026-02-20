import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  action: z.enum(['ACCEPT', 'REJECT'], {
    message: 'Action must be "ACCEPT" or "REJECT"',
  }),
  comment: z.string().max(500).optional(), 
});