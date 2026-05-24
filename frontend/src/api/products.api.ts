import type {
  ApiPaginated,
  ApiSuccess,
  Product,
  ProductDetail,
  ProductFilters,
} from '@helfy/shared';

import { apiClient } from './client';

export const productsApi = {
  list(params: ProductFilters) {
    return apiClient.get<ApiPaginated<Product>>('/products', { params });
  },

  getBySlug(slug: string) {
    return apiClient.get<ApiSuccess<ProductDetail>>(`/products/${slug}`);
  },
};
