import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { LoginInput, SignupInput } from '@helfy/shared';

import { authApi } from '@/api/auth.api';
import { cartApi } from '@/api/cart.api';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await authApi.login(input);
      return data.data;
    },
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);

      try {
        const { data: cartResponse } = await cartApi.merge();
        useCartStore.getState().setItemCount(cartResponse.data.itemCount);
      } catch {
        // Guest cart may be empty — merge is best-effort
      }

      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const { data } = await authApi.register(input);
      return data.data;
    },
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // Clear local session even if server logout fails
      }
    },
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      useCartStore.getState().setItemCount(0);
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function AuthBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!isAuthenticated || accessToken) {
      return;
    }

    let cancelled = false;

    authApi
      .refresh()
      .then(({ data }) => {
        if (!cancelled) {
          setAccessToken(data.data.accessToken);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAuth();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, accessToken, setAccessToken, clearAuth]);

  return null;
}
