import { Router } from "express";
import auth from "../../middlewares/auth";
import * as controller from "./request.controller";
import { authMiddleware } from "../../middlewares/newauth";
import { roleMiddleware } from "../../middlewares/role";

const router = Router();

router.post(
  '/:id/request',
authMiddleware,
 roleMiddleware(['SOLVER']),
  controller.requestProject
);

router.patch(
  '/:id/respond',
 authMiddleware,
 roleMiddleware(['BUYER']),
  controller.respondRequest
);

router.get(
  '/:id/requests',
  authMiddleware,
  roleMiddleware(['BUYER']),
  controller.getProjectRequests
);

export const requestRouters=  router;