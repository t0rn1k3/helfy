import type { Request, Response } from 'express';

import { ERROR_CODES } from '@helfy/shared';

import { getSessionId } from '../../middleware/optionalAuth.middleware.js';
import { AppError } from '../../utils/AppError.js';
import { ok } from '../../utils/response.js';
import { routeParam } from '../../utils/routeParam.js';
import { cartService } from './service.js';
import type { AddToCartBody, CartContext, UpdateCartItemBody } from './types.js';

function getCartContext(req: Request): CartContext {
  if (req.user) {
    return { userId: req.user.id };
  }

  const sessionId = getSessionId(req);

  if (!sessionId) {
    throw new AppError(
      400,
      ERROR_CODES.VALIDATION_ERROR,
      'X-Session-Id header is required for guest cart',
    );
  }

  return { sessionId };
}

export const cartController = {
  async getCart(req: Request, res: Response) {
    const cart = await cartService.getCart(getCartContext(req));
    return ok(res, cart);
  },

  async addItem(req: Request, res: Response) {
    const cart = await cartService.addItem(getCartContext(req), req.body as AddToCartBody);
    return ok(res, cart, 201);
  },

  async updateItem(req: Request, res: Response) {
    const cart = await cartService.updateItem(
      getCartContext(req),
      routeParam(req.params.itemId),
      req.body as UpdateCartItemBody,
    );
    return ok(res, cart);
  },

  async removeItem(req: Request, res: Response) {
    const cart = await cartService.removeItem(getCartContext(req), routeParam(req.params.itemId));
    return ok(res, cart);
  },

  async merge(req: Request, res: Response) {
    if (!req.user) {
      throw new Error('authenticate middleware required');
    }

    const sessionId = getSessionId(req);

    if (!sessionId) {
      throw new AppError(
        400,
        ERROR_CODES.VALIDATION_ERROR,
        'X-Session-Id header is required to merge guest cart',
      );
    }

    const cart = await cartService.mergeGuestCart(req.user.id, sessionId);
    return ok(res, cart);
  },
};
