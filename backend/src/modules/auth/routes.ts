import { loginSchema, signupSchema } from '@helfy/shared';
import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { authRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authController } from './controller.js';

export const authRoutes = Router();

authRoutes.use(authRateLimiter);

authRoutes.post('/register', validate(signupSchema), asyncHandler(authController.register));
authRoutes.post('/login', validate(loginSchema), asyncHandler(authController.login));
authRoutes.post('/refresh', asyncHandler(authController.refresh));
authRoutes.post('/logout', authenticate, asyncHandler(authController.logout));
authRoutes.post('/logout-all', authenticate, asyncHandler(authController.logoutAll));
