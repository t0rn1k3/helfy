import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ordersController } from './controller.js';
import { checkoutSchema, orderListQuerySchema } from './validators.js';

export const ordersRoutes = Router();

ordersRoutes.use(authenticate);

ordersRoutes.post('/', validate(checkoutSchema), asyncHandler(ordersController.create));
ordersRoutes.get('/', validate(orderListQuerySchema, 'query'), asyncHandler(ordersController.list));
ordersRoutes.get('/:id', asyncHandler(ordersController.getById));
