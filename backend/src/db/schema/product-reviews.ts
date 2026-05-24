import { mysqlTable, varchar, text, int, timestamp, index, uniqueIndex } from 'drizzle-orm/mysql-core';

import { products } from './products.js';
import { users } from './users.js';

export const productReviews = mysqlTable(
  'product_reviews',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    productId: varchar('product_id', { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: int('rating').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('product_reviews_product_id_idx').on(table.productId),
    uniqueIndex('product_reviews_product_user_uidx').on(table.productId, table.userId),
  ],
);

export type ProductReview = typeof productReviews.$inferSelect;
export type NewProductReview = typeof productReviews.$inferInsert;
