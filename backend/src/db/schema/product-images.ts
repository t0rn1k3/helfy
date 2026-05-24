import { mysqlTable, varchar, int, timestamp, index } from 'drizzle-orm/mysql-core';

import { products } from './products.js';

export const productImages = mysqlTable(
  'product_images',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    productId: varchar('product_id', { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: varchar('url', { length: 512 }).notNull(),
    alt: varchar('alt', { length: 255 }),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('product_images_product_id_idx').on(table.productId)],
);

export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
