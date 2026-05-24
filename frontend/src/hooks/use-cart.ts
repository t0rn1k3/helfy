import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddToCartInput, UpdateCartItemInput } from '@helfy/shared';

import { cartApi } from '@/api/cart.api';
import { getOrCreateSessionId } from '@/lib/session';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

function useCartQueryKey() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionId = getOrCreateSessionId();

  return ['cart', isAuthenticated ? 'user' : sessionId] as const;
}

export function useCart() {
  const queryKey = useCartQueryKey();
  const setItemCount = useCartStore((state) => state.setItemCount);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await cartApi.get();
      return data.data;
    },
    meta: {
      errorMessage: 'Failed to load cart',
    },
  });

  useEffect(() => {
    if (query.data) {
      setItemCount(query.data.itemCount);
    }
  }, [query.data, setItemCount]);

  return query;
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const queryKey = useCartQueryKey();
  const setItemCount = useCartStore((state) => state.setItemCount);

  return useMutation({
    mutationFn: async (input: AddToCartInput) => {
      const { data } = await cartApi.addItem(input);
      return data.data;
    },
    onSuccess: (cart) => {
      setItemCount(cart.itemCount);
      queryClient.setQueryData(queryKey, cart);
    },
    meta: {
      errorMessage: 'Failed to add item to cart',
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const queryKey = useCartQueryKey();
  const setItemCount = useCartStore((state) => state.setItemCount);

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: UpdateCartItemInput['quantity'] }) => {
      const { data } = await cartApi.updateItem(itemId, { quantity });
      return data.data;
    },
    onSuccess: (cart) => {
      setItemCount(cart.itemCount);
      queryClient.setQueryData(queryKey, cart);
    },
    meta: {
      errorMessage: 'Failed to update cart item',
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const queryKey = useCartQueryKey();
  const setItemCount = useCartStore((state) => state.setItemCount);

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await cartApi.removeItem(itemId);
      return data.data;
    },
    onSuccess: (cart) => {
      setItemCount(cart.itemCount);
      queryClient.setQueryData(queryKey, cart);
    },
    meta: {
      errorMessage: 'Failed to remove cart item',
    },
  });
}
