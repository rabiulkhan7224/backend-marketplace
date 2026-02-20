import { z } from 'zod';

export const createTaskZod = z.object({
 body:z.object({ title: z.string().min(3),
  description: z.string().min(10),
  deadline: z.string().datetime({ message: 'Invalid date format' }),
})});



export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  deadline: z.string().datetime({ message: 'Invalid date format (use ISO 8601)' }),
});

export const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  deadline: z.string().datetime().optional(),
  // status not allowed to be updated directly by solver — only via submission/review
}).partial().refine(
  data => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);