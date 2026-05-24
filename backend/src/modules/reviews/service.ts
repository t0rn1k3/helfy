import crypto from 'crypto';

import { ERROR_CODES } from '@helfy/shared';

import { AppError } from '../../utils/AppError.js';
import { toReviewDto, toReviewWithUserDto } from '../../utils/mappers.js';
import { buildPaginationMeta } from '../../utils/pagination.js';
import { productsRepository } from '../products/repository.js';
import { reviewsRepository } from './repository.js';
import type { CreateReviewBody } from './types.js';

export const reviewsService = {
  async listByProductSlug(slug: string, page: number, limit: number) {
    const product = await productsRepository.findBySlug(slug);

    if (!product) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');
    }

    const { items, total } = await reviewsRepository.findByProductId(product.id, page, limit);

    return {
      items: items.map((row) => toReviewWithUserDto(row.review, row.user)),
      pagination: buildPaginationMeta(page, limit, total),
    };
  },

  async createReview(slug: string, userId: string, input: CreateReviewBody) {
    const product = await productsRepository.findBySlug(slug);

    if (!product) {
      throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Product not found');
    }

    const existing = await reviewsRepository.findByProductAndUser(product.id, userId);

    if (existing) {
      throw new AppError(409, ERROR_CODES.CONFLICT, 'You have already reviewed this product');
    }

    await reviewsRepository.createReview({
      id: crypto.randomUUID(),
      productId: product.id,
      userId,
      rating: input.rating,
      title: input.title.trim(),
      body: input.body.trim(),
    });

    await reviewsRepository.refreshProductRatingStats(product.id);

    const created = await reviewsRepository.findByProductAndUser(product.id, userId);

    if (!created) {
      throw new AppError(500, ERROR_CODES.INTERNAL_ERROR, 'Failed to create review');
    }

    return toReviewDto(created);
  },
};
