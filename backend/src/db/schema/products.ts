import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  index,
  decimal,
} from 'drizzle-orm/mysql-core';

import { categories } from './categories.js';

export const products = mysqlTable(
  'products',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    categoryId: varchar('category_id', { length: 36 })
      .notNull()
      .references(() => categories.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description').notNull(),
    price: int('price').notNull(),
    compareAtPrice: int('compare_at_price'),
    brand: varchar('brand', { length: 100 }).notNull(),
    stock: int('stock').notNull().default(0),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).notNull().default('0.00'),
    reviewCount: int('review_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index('products_slug_idx').on(table.slug),
    index('products_category_id_idx').on(table.categoryId),
    index('products_brand_idx').on(table.brand),
  ],
);

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
