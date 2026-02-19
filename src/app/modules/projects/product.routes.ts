import { Router } from "express";
import * as controller from "./project.controller";
import { UserRole } from "../../constants/userRole_constant";
import auth from "../../middlewares/auth";


const router = Router();

router.post('/', 
    auth("BUYER"),
    controller.createProject);

export const projectRoute = router;