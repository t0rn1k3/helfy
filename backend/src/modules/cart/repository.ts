import { and, eq, isNull } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { cartItems } from '../../db/schema/cart-items.js';
import { carts } from '../../db/schema/carts.js';
import { products } from '../../db/schema/products.js';

export const cartRepository = {
  findByUserId(userId: string) {
    return db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });
  },

  findBySessionId(sessionId: string) {
    return db.query.carts.findFirst({
      where: and(eq(carts.sessionId, sessionId), isNull(carts.userId)),
    });
  },

  findById(cartId: string) {
    return db.query.carts.findFirst({
      where: eq(carts.id, cartId),
    });
  },

  async createCart(data: { id: string; userId?: string; sessionId?: string }) {
    await db.insert(carts).values({
      id: data.id,
      userId: data.userId ?? null,
      sessionId: data.sessionId ?? null,
    });
    return cartRepository.findById(data.id);
  },

  deleteCart(cartId: string) {
    return db.delete(carts).where(eq(carts.id, cartId));
  },

  findItemsByCartId(cartId: string) {
    return db
      .select({
        item: cartItems,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cartId));
  },

  findItemById(itemId: string) {
    return db.query.cartItems.findFirst({
      where: eq(cartItems.id, itemId),
    });
  },

  findItemByCartAndProduct(cartId: string, productId: string) {
    return db.query.cartItems.findFirst({
      where: and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)),
    });
  },

  async insertItem(data: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    priceSnapshot: number;
  }) {
    await db.insert(cartItems).values(data);
  },

  async updateItem(
    itemId: string,
    data: { quantity?: number; priceSnapshot?: number },
  ) {
    await db.update(cartItems).set(data).where(eq(cartItems.id, itemId));
  },

  deleteItem(itemId: string) {
    return db.delete(cartItems).where(eq(cartItems.id, itemId));
  },
};
