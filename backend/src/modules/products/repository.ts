import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  ne,
  sql,
  type SQL,
} from 'drizzle-orm';

import { db } from '../../db/client.js';
import { categories } from '../../db/schema/categories.js';
import { productImages } from '../../db/schema/product-images.js';
import { products } from '../../db/schema/products.js';
import { getOffset } from '../../utils/pagination.js';
import type { ProductListFilters } from './types.js';

function buildWhereClause(filters: ProductListFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.q) {
    conditions.push(
      sql`MATCH(${products.name}, ${products.description}) AGAINST(${filters.q} IN NATURAL LANGUAGE MODE)`,
    );
  }

  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice));
  }

  if (filters.brand) {
    conditions.push(eq(products.brand, filters.brand));
  }

  if (filters.minRating !== undefined) {
    conditions.push(gte(products.averageRating, String(filters.minRating)));
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}

function buildOrderBy(sort: ProductListFilters['sort']) {
  switch (sort) {
    case 'price_asc':
      return asc(products.price);
    case 'price_desc':
      return desc(products.price);
    case 'popular':
      return desc(products.reviewCount);
    case 'newest':
    default:
      return desc(products.createdAt);
  }
}

export const productsRepository = {
  async findMany(filters: ProductListFilters) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = getOffset(page, limit);
    const whereClause = buildWhereClause(filters);
    const needsCategoryJoin = Boolean(filters.category);

    const baseFrom = needsCategoryJoin
      ? db
          .select({ product: products })
          .from(products)
          .innerJoin(categories, eq(products.categoryId, categories.id))
      : db.select({ product: products }).from(products);

    const whereQuery = whereClause ? baseFrom.where(whereClause) : baseFrom;

    const [rows, totalRows] = await Promise.all([
      whereQuery.orderBy(buildOrderBy(filters.sort)).limit(limit).offset(offset),
      (needsCategoryJoin
        ? db
            .select({ total: count() })
            .from(products)
            .innerJoin(categories, eq(products.categoryId, categories.id))
        : db.select({ total: count() }).from(products)
      ).where(whereClause ?? sql`1=1`),
    ]);

    return {
      items: rows.map((row) => row.product),
      total: Number(totalRows[0]?.total ?? 0),
    };
  },

  findBySlug(slug: string) {
    return db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
  },

  findById(id: string) {
    return db.query.products.findFirst({
      where: eq(products.id, id),
    });
  },

  findImagesByProductId(productId: string) {
    return db.query.productImages.findMany({
      where: eq(productImages.productId, productId),
      orderBy: asc(productImages.sortOrder),
    });
  },

  async findRelated(productId: string, categoryId: string, limit = 4) {
    return db.query.products.findMany({
      where: and(eq(products.categoryId, categoryId), ne(products.id, productId)),
      orderBy: desc(products.reviewCount),
      limit,
    });
  },
};
