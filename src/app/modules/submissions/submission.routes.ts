// src/modules/submissions/routes.ts
import { Router } from 'express';
import * as controller from './submission.controller';
import { roleMiddleware } from '../../middlewares/role';
import { authMiddleware } from '../../middlewares/newauth';

const router = Router();

// Submit ZIP file for a task (only assigned SOLVER)
router.post(
  '/tasks/:taskId/submit',
  authMiddleware,
  roleMiddleware(['SOLVER']),
  controller.submitTask
);

// Buyer reviews submission (ACCEPT / REJECT)
router.patch(
  '/tasks/:taskId/review',
  authMiddleware,
  roleMiddleware(['BUYER']),
  controller.reviewTaskSubmission
);

// Get submission details (buyer, solver or admin)
router.get(
  '/tasks/:taskId/submission',
  authMiddleware,
  controller.getSubmission
);

export const submissionRoutes= router;