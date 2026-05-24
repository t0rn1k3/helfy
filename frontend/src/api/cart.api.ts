import type {
  AddToCartInput,
  ApiSuccess,
  CartWithItems,
  UpdateCartItemInput,
} from '@helfy/shared';

import { apiClient } from './client';

export const cartApi = {
  get() {
    return apiClient.get<ApiSuccess<CartWithItems>>('/cart');
  },

  addItem(input: AddToCartInput) {
    return apiClient.post<ApiSuccess<CartWithItems>>('/cart/items', input);
  },

  updateItem(itemId: string, input: UpdateCartItemInput) {
    return apiClient.patch<ApiSuccess<CartWithItems>>(`/cart/items/${itemId}`, input);
  },

  removeItem(itemId: string) {
    return apiClient.delete<ApiSuccess<CartWithItems>>(`/cart/items/${itemId}`);
  },

  merge() {
    return apiClient.post<ApiSuccess<CartWithItems>>('/cart/merge');
  },
};
