import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { usersController } from './controller.js';
import {
  addressSchema,
  changePasswordSchema,
  updateProfileSchema,
} from './validators.js';

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', asyncHandler(usersController.getMe));
usersRoutes.patch('/me', validate(updateProfileSchema), asyncHandler(usersController.updateMe));
usersRoutes.patch(
  '/me/password',
  validate(changePasswordSchema),
  asyncHandler(usersController.changePassword),
);
usersRoutes.get('/me/addresses', asyncHandler(usersController.listAddresses));
usersRoutes.post(
  '/me/addresses',
  validate(addressSchema),
  asyncHandler(usersController.createAddress),
);
usersRoutes.patch(
  '/me/addresses/:id',
  validate(addressSchema),
  asyncHandler(usersController.updateAddress),
);
usersRoutes.delete('/me/addresses/:id', asyncHandler(usersController.deleteAddress));
usersRoutes.patch('/me/addresses/:id/default', asyncHandler(usersController.setDefaultAddress));
