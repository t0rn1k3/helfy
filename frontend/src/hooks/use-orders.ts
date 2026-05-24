import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CheckoutInput } from '@helfy/shared';

import { ordersApi, type OrderListParams } from '@/api/orders.api';

export function useOrders(params: OrderListParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await ordersApi.list(params);
      return data;
    },
    placeholderData: keepPreviousData,
    meta: {
      errorMessage: 'Failed to load orders',
    },
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: async () => {
      const { data } = await ordersApi.getById(orderId);
      return data.data;
    },
    enabled: Boolean(orderId),
    meta: {
      errorMessage: 'Failed to load order',
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const { data } = await ordersApi.create(input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    meta: {
      errorMessage: 'Failed to place order',
    },
  });
}
