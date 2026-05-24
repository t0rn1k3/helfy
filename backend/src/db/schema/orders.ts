import { mysqlTable, varchar, int, timestamp, json, mysqlEnum, index } from 'drizzle-orm/mysql-core';

import { users } from './users.js';

export const orderStatusValues = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof orderStatusValues)[number];

export const orders = mysqlTable(
  'orders',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: mysqlEnum('status', orderStatusValues).notNull().default('pending'),
    subtotal: int('subtotal').notNull(),
    shipping: int('shipping').notNull().default(0),
    tax: int('tax').notNull().default(0),
    total: int('total').notNull(),
    shippingAddress: json('shipping_address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('orders_user_id_idx').on(table.userId),
    index('orders_status_idx').on(table.status),
  ],
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
