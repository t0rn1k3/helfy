import type { Request, Response } from 'express';

import { paginated, ok } from '../../utils/response.js';
import { routeParam } from '../../utils/routeParam.js';
import { productsService } from './service.js';
import type { ProductListFilters } from './types.js';

export const productsController = {
  async list(req: Request, res: Response) {
    const filters = req.query as unknown as ProductListFilters;
    const { items, pagination } = await productsService.listProducts(filters);
    return paginated(res, items, pagination);
  },

  async getBySlug(req: Request, res: Response) {
    const product = await productsService.getProductBySlug(routeParam(req.params.slug));
    return ok(res, product);
  },
};
