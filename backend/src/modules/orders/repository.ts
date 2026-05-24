import { and, count, desc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { cartItems } from '../../db/schema/cart-items.js';
import { orderItems } from '../../db/schema/order-items.js';
import { orders } from '../../db/schema/orders.js';
import { getOffset } from '../../utils/pagination.js';

export const ordersRepository = {
  async createOrderWithItems(
    order: {
      id: string;
      userId: string;
      status: 'confirmed';
      subtotal: number;
      shipping: number;
      tax: number;
      total: number;
      shippingAddress: Record<string, unknown>;
    },
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      priceSnapshot: number;
    }>,
    cartId: string,
  ) {
    await db.transaction(async (tx) => {
      await tx.insert(orders).values(order);

      if (items.length > 0) {
        await tx.insert(orderItems).values(
          items.map((item) => ({
            id: item.id,
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            priceSnapshot: item.priceSnapshot,
          })),
        );
      }

      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
    });
  },

  async findByUserId(userId: string, page: number, limit: number) {
    const offset = getOffset(page, limit);
    const where = eq(orders.userId, userId);

    const [rows, totalRows] = await Promise.all([
      db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
      db.select({ total: count() }).from(orders).where(where),
    ]);

    return {
      items: rows,
      total: Number(totalRows[0]?.total ?? 0),
    };
  },

  findByIdForUser(orderId: string, userId: string) {
    return db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    });
  },

  findItemsByOrderId(orderId: string) {
    return db.query.orderItems.findMany({
      where: eq(orderItems.orderId, orderId),
    });
  },
};
