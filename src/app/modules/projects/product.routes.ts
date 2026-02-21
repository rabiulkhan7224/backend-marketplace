import { Router } from "express";
import * as controller from "./project.controller";
import { UserRole } from "../../constants/userRole_constant";
import auth from "../../middlewares/auth";
import { authMiddleware } from "../../middlewares/newauth";


const router = Router();

router.post('/', 
    auth("BUYER"),
    controller.createProject);
router.get('/', controller.getProjects);
router.get('/:id', controller.getProjectById);
router.get('/:id/auth', authMiddleware, controller.getProjectByIdAuth);

export const projectRoute = router;