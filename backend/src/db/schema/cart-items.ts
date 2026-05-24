import { mysqlTable, varchar, int, timestamp, index, uniqueIndex } from 'drizzle-orm/mysql-core';

import { carts } from './carts.js';
import { products } from './products.js';

export const cartItems = mysqlTable(
  'cart_items',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    cartId: varchar('cart_id', { length: 36 })
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: varchar('product_id', { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: int('quantity').notNull().default(1),
    priceSnapshot: int('price_snapshot').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('cart_items_cart_id_idx').on(table.cartId),
    uniqueIndex('cart_items_cart_product_uidx').on(table.cartId, table.productId),
  ],
);

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
