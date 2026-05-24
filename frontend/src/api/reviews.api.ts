import type { ApiPaginated, ApiSuccess, CreateReviewInput, Review, ReviewWithUser } from '@helfy/shared';

import { apiClient } from './client';

export const reviewsApi = {
  listByProductSlug(slug: string, params?: { page?: number; limit?: number }) {
    return apiClient.get<ApiPaginated<ReviewWithUser>>(`/products/${slug}/reviews`, { params });
  },

  createForProduct(slug: string, input: CreateReviewInput) {
    return apiClient.post<ApiSuccess<Review>>(`/products/${slug}/reviews`, input);
  },
};
