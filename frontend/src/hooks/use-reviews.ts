import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReviewInput } from '@helfy/shared';

import { reviewsApi } from '@/api/reviews.api';

export function useProductReviews(slug: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['reviews', slug, params],
    queryFn: async () => {
      const { data } = await reviewsApi.listByProductSlug(slug, params);
      return data;
    },
    enabled: Boolean(slug),
    meta: {
      errorMessage: 'Failed to load reviews',
    },
  });
}

export function useCreateReview(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data } = await reviewsApi.createForProduct(slug, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
    },
    meta: {
      errorMessage: 'Failed to submit review',
    },
  });
}
