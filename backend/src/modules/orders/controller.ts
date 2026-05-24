import type { Request, Response } from 'express';

import { ok, paginated } from '../../utils/response.js';
import { routeParam } from '../../utils/routeParam.js';
import { ordersService } from './service.js';
import type { CreateOrderBody } from './types.js';
import type { OrderListQuery } from './validators.js';

export const ordersController = {
  async create(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const order = await ordersService.createOrder(req.user.id, req.body as CreateOrderBody);
    return ok(res, order, 201);
  },

  async list(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const { page, limit } = req.query as unknown as OrderListQuery;
    const { items, pagination } = await ordersService.listOrders(req.user.id, page, limit);
    return paginated(res, items, pagination);
  },

  async getById(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const order = await ordersService.getOrderById(req.user.id, routeParam(req.params.id));
    return ok(res, order);
  },
};
