import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1).max(36),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3).max(255),
  body: z.string().min(10).max(2000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const productFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  brand: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
