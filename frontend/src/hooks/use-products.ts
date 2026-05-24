import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ProductFilters } from '@helfy/shared';

import { productsApi } from '@/api/products.api';

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await productsApi.list(filters);
      return data;
    },
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: 'Failed to load products',
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await productsApi.getBySlug(slug);
      return data.data;
    },
    enabled: Boolean(slug),
    meta: {
      errorMessage: 'Failed to load product',
    },
  });
}
