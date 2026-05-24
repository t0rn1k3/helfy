import { Router } from 'express';

import { validate } from '../../middleware/validate.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { reviewsController } from '../reviews/controller.js';
import { createReviewSchema, reviewListQuerySchema } from '../reviews/validators.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { productsController } from './controller.js';
import { productFiltersSchema } from './validators.js';

export const productsRoutes = Router();

productsRoutes.get('/', validate(productFiltersSchema, 'query'), asyncHandler(productsController.list));
productsRoutes.get(
  '/:slug/reviews',
  validate(reviewListQuerySchema, 'query'),
  asyncHandler(reviewsController.listByProductSlug),
);
productsRoutes.post(
  '/:slug/reviews',
  authenticate,
  validate(createReviewSchema),
  asyncHandler(reviewsController.createForProductSlug),
);
productsRoutes.get('/:slug', asyncHandler(productsController.getBySlug));
