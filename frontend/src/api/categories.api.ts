import type { ApiSuccess, Category } from '@helfy/shared';

import { apiClient } from './client';

export const categoriesApi = {
  list() {
    return apiClient.get<ApiSuccess<Category[]>>('/categories');
  },
};
