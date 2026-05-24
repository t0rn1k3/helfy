import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { usersController } from './controller.js';

export const usersRoutes = Router();

usersRoutes.get('/me', authenticate, asyncHandler(usersController.getMe));
