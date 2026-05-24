import type { Request, Response } from 'express';

import { paginated, ok } from '../../utils/response.js';
import { routeParam } from '../../utils/routeParam.js';
import { reviewsService } from './service.js';
import type { ReviewListQuery } from './validators.js';

export const reviewsController = {
  async listByProductSlug(req: Request, res: Response) {
    const { page, limit } = req.query as unknown as ReviewListQuery;
    const { items, pagination } = await reviewsService.listByProductSlug(
      routeParam(req.params.slug),
      page,
      limit,
    );
    return paginated(res, items, pagination);
  },

  async createForProductSlug(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const review = await reviewsService.createReview(routeParam(req.params.slug), req.user.id, req.body);
    return ok(res, review, 201);
  },
};
