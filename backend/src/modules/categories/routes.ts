import { Router } from 'express';

import { asyncHandler } from '../../utils/asyncHandler.js';
import { categoriesController } from './controller.js';

export const categoriesRoutes = Router();

categoriesRoutes.get('/', asyncHandler(categoriesController.list));
