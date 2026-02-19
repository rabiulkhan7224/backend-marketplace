import { Router } from 'express';
import * as controller from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { loginSchema, registerSchema, userSchema } from './schemas';
import auth from '../../middlewares/auth';

const router = Router();

router.post('/register',
    validateRequest(userSchema),
    controller.register);

    router.post('/login',
    validateRequest(loginSchema),
    controller.login);

router.get('/me', 
    auth(true),
    controller.getMe);


export const authRoute= router;