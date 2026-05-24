import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { optionalAuthenticate } from '../../middleware/optionalAuth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { cartController } from './controller.js';
import { addToCartSchema, updateCartItemSchema } from './validators.js';

export const cartRoutes = Router();

cartRoutes.use(optionalAuthenticate);

cartRoutes.get('/', asyncHandler(cartController.getCart));
cartRoutes.post('/items', validate(addToCartSchema), asyncHandler(cartController.addItem));
cartRoutes.patch(
  '/items/:itemId',
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
cartRoutes.delete('/items/:itemId', asyncHandler(cartController.removeItem));
cartRoutes.post('/merge', authenticate, asyncHandler(cartController.merge));
