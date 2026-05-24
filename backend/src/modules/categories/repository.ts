import { count, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { categories } from '../../db/schema/categories.js';
import { products } from '../../db/schema/products.js';

export const categoriesRepository = {
  async findAllWithProductCounts() {
    const rows = await db
      .select({
        category: categories,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id);

    return rows;
  },

  findBySlug(slug: string) {
    return db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
  },

  findById(id: string) {
    return db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
  },
};
