import { Router } from 'express';
import * as controller from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { registerSchema, userSchema } from './schemas';

const router = Router();

router.post('/register',
    validateRequest(userSchema),
    controller.register);


export const authRoute= router;