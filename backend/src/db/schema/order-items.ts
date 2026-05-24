import { mysqlTable, varchar, int, timestamp, index } from 'drizzle-orm/mysql-core';

import { orders } from './orders.js';
import { products } from './products.js';

export const orderItems = mysqlTable(
  'order_items',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    orderId: varchar('order_id', { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    quantity: int('quantity').notNull(),
    priceSnapshot: int('price_snapshot').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)],
);

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
