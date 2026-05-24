import type { Request, Response } from 'express';

import { ok } from '../../utils/response.js';
import { routeParam } from '../../utils/routeParam.js';
import { usersService } from './service.js';
import type { AddressBody, ChangePasswordBody, UpdateProfileBody } from './types.js';

export const usersController = {
  async getMe(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const user = await usersService.getProfile(req.user.id);
    return ok(res, user);
  },

  async updateMe(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const user = await usersService.updateProfile(req.user.id, req.body as UpdateProfileBody);
    return ok(res, user);
  },

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    await usersService.changePassword(req.user.id, req.body as ChangePasswordBody);
    return ok(res, { updated: true });
  },

  async listAddresses(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const addresses = await usersService.listAddresses(req.user.id);
    return ok(res, addresses);
  },

  async createAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const address = await usersService.createAddress(req.user.id, req.body as AddressBody);
    return ok(res, address, 201);
  },

  async updateAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const address = await usersService.updateAddress(
      req.user.id,
      routeParam(req.params.id),
      req.body as AddressBody,
    );
    return ok(res, address);
  },

  async deleteAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    await usersService.deleteAddress(req.user.id, routeParam(req.params.id));
    return ok(res, { deleted: true });
  },

  async setDefaultAddress(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const address = await usersService.setDefaultAddress(req.user.id, routeParam(req.params.id));
    return ok(res, address);
  },
};
