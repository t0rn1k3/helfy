import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddressInput, ChangePasswordInput, UpdateProfileInput } from '@helfy/shared';

import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await usersApi.getMe();
      return data.data;
    },
    enabled: isAuthenticated,
    meta: { errorMessage: 'Failed to load profile' },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await usersApi.updateMe(input);
      return data.data;
    },
    onSuccess: (user) => {
      useAuthStore.setState({ user });
      queryClient.setQueryData(['profile'], user);
      toast.success('Profile updated');
    },
    meta: { errorMessage: 'Failed to update profile' },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => usersApi.changePassword(input),
    onSuccess: () => toast.success('Password updated'),
    meta: { errorMessage: 'Failed to change password' },
  });
}

export function useAddresses() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await usersApi.listAddresses();
      return data.data;
    },
    enabled: isAuthenticated,
    meta: { errorMessage: 'Failed to load addresses' },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddressInput) => {
      const { data } = await usersApi.createAddress(input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address added');
    },
    meta: { errorMessage: 'Failed to add address' },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: AddressInput }) => {
      const { data } = await usersApi.updateAddress(id, input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address updated');
    },
    meta: { errorMessage: 'Failed to update address' },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address deleted');
    },
    meta: { errorMessage: 'Failed to delete address' },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await usersApi.setDefaultAddress(id);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default address updated');
    },
    meta: { errorMessage: 'Failed to set default address' },
  });
}
