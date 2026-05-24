import type { Request, Response } from 'express';

import { ok } from '../../utils/response.js';
import { categoriesService } from './service.js';

export const categoriesController = {
  async list(_req: Request, res: Response) {
    const categories = await categoriesService.listCategories();
    return ok(res, categories);
  },
};
