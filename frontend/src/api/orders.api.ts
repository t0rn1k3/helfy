import type {
  ApiPaginated,
  ApiSuccess,
  CheckoutInput,
  Order,
  OrderWithItems,
} from '@helfy/shared';

import { apiClient } from './client';

export interface OrderListParams {
  page?: number;
  limit?: number;
}

export const ordersApi = {
  create(input: CheckoutInput) {
    return apiClient.post<ApiSuccess<OrderWithItems>>('/orders', input);
  },

  list(params?: OrderListParams) {
    return apiClient.get<ApiPaginated<Order>>('/orders', { params });
  },

  getById(id: string) {
    return apiClient.get<ApiSuccess<OrderWithItems>>(`/orders/${id}`);
  },
};
