import crypto from 'crypto';

import { ERROR_CODES } from '@helfy/shared';
import type { CartWithItems } from '@helfy/shared';

import { AppError } from '../../utils/AppError.js';
import {
  toCartItemWithProductDto,
  toCartWithItemsDto,
} from '../../utils/mappers.js';
import { productsRepository } from '../products/repository.js';
import { cartRepository } from './repository.js';
import type { AddToCartBody, CartContext, UpdateCartItemBody } from './types.js';

function resolveCartContext(context: CartContext): CartContext {
  if (context.userId) {
    return { userId: context.userId };
  }

  if (context.sessionId) {
    return { sessionId: context.sessionId };
  }

  throw new AppError(
    400,
    ERROR_CODES.VALIDATION_ERROR,
    'Authentication or X-Session-Id header is required',
  );
}

async function getOrCreateCart(context: CartContext) {
  const resolved = resolveCartContext(context);

  if (resolved.userId) {
    const existing = await cartRepository.findByUserId(resolved.userId);
    if (existing) {
      return existing;
    }

    const created = await cartRepository.createCart({
      id: crypto.randomUUID(),
      userId: resolved.userId,
    });

    if (!created) {
      throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create cart');
    }

    return created;
  }

  const existing = await cartRepository.findBySessionId(resolved.sessionId!);
  if (existing) {
    return existing;
  }

  const created = await cartRepository.createCart({
    id: crypto.randomUUID(),
    sessionId: resolved.sessionId!,
  });

  if (!created) {
    throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create cart');
  }

  return created;
}

async function loadCartWithItems(cartId: string): Promise<CartWithItems> {
  const cart = await cartRepository.findById(cartId);

  if (!cart) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Cart not found');
  }

  const rows = await cartRepository.findItemsByCartId(cartId);
  const items = rows.map((row) => toCartItemWithProductDto(row.item, row.product));
  return toCartWithItemsDto(cart, items);
}

async function assertCartAccess(cartId: string, context: CartContext) {
  const cart = await cartRepository.findById(cartId);

  if (!cart) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Cart item not found');
  }

  const resolved = resolveCartContext(context);

  if (resolved.userId) {
    if (cart.userId !== resolved.userId) {
      throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Cart access denied');
    }
    return cart;
  }

  if (cart.sessionId !== resolved.sessionId || cart.userId !== null) {
    throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Cart access denied');
  }

  return cart;
}

export const cartService = {
  getCart(context: CartContext) {
    return getOrCreateCart(context).then((cart) => loadCartWithItems(cart.id));
  },

  async addItem(context: CartContext, input: AddToCartBody) {
    const cart = await getOrCreateCart(context);
    const product = await productsRepository.findById(input.productId);

    if (!product) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');
    }

    if (product.stock < input.quantity) {
      throw new AppError(422, ERROR_CODES.UNPROCESSABLE, 'Insufficient stock');
    }

    const existing = await cartRepository.findItemByCartAndProduct(cart.id, product.id);

    if (existing) {
      const quantity = Math.min(99, existing.quantity + input.quantity);

      if (product.stock < quantity) {
        throw new AppError(422, ERROR_CODES.UNPROCESSABLE, 'Insufficient stock');
      }

      await cartRepository.updateItem(existing.id, { quantity });
    } else {
      await cartRepository.insertItem({
        id: crypto.randomUUID(),
        cartId: cart.id,
        productId: product.id,
        quantity: input.quantity,
        priceSnapshot: product.price,
      });
    }

    return loadCartWithItems(cart.id);
  },

  async updateItem(context: CartContext, itemId: string, input: UpdateCartItemBody) {
    const item = await cartRepository.findItemById(itemId);

    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Cart item not found');
    }

    await assertCartAccess(item.cartId, context);

    const product = await productsRepository.findById(item.productId);

    if (!product) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');
    }

    if (product.stock < input.quantity) {
      throw new AppError(422, ERROR_CODES.UNPROCESSABLE, 'Insufficient stock');
    }

    await cartRepository.updateItem(itemId, { quantity: input.quantity });
    return loadCartWithItems(item.cartId);
  },

  async removeItem(context: CartContext, itemId: string) {
    const item = await cartRepository.findItemById(itemId);

    if (!item) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Cart item not found');
    }

    await assertCartAccess(item.cartId, context);
    await cartRepository.deleteItem(itemId);
    return loadCartWithItems(item.cartId);
  },

  async mergeGuestCart(userId: string, sessionId: string) {
    const guestCart = await cartRepository.findBySessionId(sessionId);

    if (!guestCart) {
      return cartService.getCart({ userId });
    }

    const userCart = await getOrCreateCart({ userId });
    const [guestItems, userItems] = await Promise.all([
      cartRepository.findItemsByCartId(guestCart.id),
      cartRepository.findItemsByCartId(userCart.id),
    ]);

    for (const guestRow of guestItems) {
      const guestItem = guestRow.item;
      const existing = userItems.find((row) => row.item.productId === guestItem.productId);

      if (existing) {
        const quantity = Math.min(99, existing.item.quantity + guestItem.quantity);
        const priceSnapshot = Math.min(existing.item.priceSnapshot, guestItem.priceSnapshot);
        await cartRepository.updateItem(existing.item.id, { quantity, priceSnapshot });
      } else {
        await cartRepository.insertItem({
          id: crypto.randomUUID(),
          cartId: userCart.id,
          productId: guestItem.productId,
          quantity: guestItem.quantity,
          priceSnapshot: guestItem.priceSnapshot,
        });
      }
    }

    await cartRepository.deleteCart(guestCart.id);
    return loadCartWithItems(userCart.id);
  },
};
