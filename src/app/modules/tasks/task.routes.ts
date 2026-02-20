import { Router } from "express";
import auth from "../../middlewares/auth";
import * as controller from "./task.controller";

const router = Router();

// Create task (only assigned SOLVER)
router.post(
  '/projects/:projectId/tasks',
   auth('SOLVER'),
  controller.createTask
);

// List all tasks for a project (BUYER or assigned SOLVER or ADMIN)
router.get(
  '/projects/:projectId/tasks',
  auth(true),
  controller.getTasks
);

// Get single task (BUYER or assigned SOLVER or ADMIN)
router.get(
  '/tasks/:id',
    auth(true),
  controller.getTask
);

// Update task metadata (only assigned SOLVER, before submission)
router.patch(
  '/tasks/:id',

  auth('SOLVER'),
  controller.updateTaskCtrl
);

export const taskRoute = router;