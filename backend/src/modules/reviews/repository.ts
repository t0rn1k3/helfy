import { and, count, desc, eq, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { productReviews } from '../../db/schema/product-reviews.js';
import { products } from '../../db/schema/products.js';
import { users } from '../../db/schema/users.js';
import { getOffset } from '../../utils/pagination.js';

export const reviewsRepository = {
  async findByProductId(productId: string, page: number, limit: number) {
    const offset = getOffset(page, limit);
    const where = eq(productReviews.productId, productId);

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          review: productReviews,
          user: { id: users.id, name: users.name },
        })
        .from(productReviews)
        .innerJoin(users, eq(productReviews.userId, users.id))
        .where(where)
        .orderBy(desc(productReviews.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(productReviews).where(where),
    ]);

    return {
      items: rows,
      total: Number(totalRows[0]?.total ?? 0),
    };
  },

  findByProductAndUser(productId: string, userId: string) {
    return db.query.productReviews.findFirst({
      where: and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)),
    });
  },

  async createReview(data: {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    title: string;
    body: string;
  }) {
    await db.insert(productReviews).values(data);
  },

  async refreshProductRatingStats(productId: string) {
    const [stats] = await db
      .select({
        average: sql<string>`coalesce(avg(${productReviews.rating}), 0)`,
        total: count(),
      })
      .from(productReviews)
      .where(eq(productReviews.productId, productId));

    await db
      .update(products)
      .set({
        averageRating: Number(stats?.average ?? 0).toFixed(2),
        reviewCount: Number(stats?.total ?? 0),
      })
      .where(eq(products.id, productId));
  },
};
