import type { Request, Response } from 'express';

import { ok } from '../../utils/response.js';
import { usersService } from './service.js';

export const usersController = {
  async getMe(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const user = await usersService.getProfile(req.user.id);
    return ok(res, user);
  },
};
