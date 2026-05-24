import type {
  Address,
  AddressInput,
  ApiSuccess,
  ChangePasswordInput,
  UpdateProfileInput,
  User,
} from '@helfy/shared';

import { apiClient } from './client';

export const usersApi = {
  getMe() {
    return apiClient.get<ApiSuccess<User>>('/me');
  },

  updateMe(input: UpdateProfileInput) {
    return apiClient.patch<ApiSuccess<User>>('/me', input);
  },

  changePassword(input: ChangePasswordInput) {
    return apiClient.patch<ApiSuccess<{ updated: boolean }>>('/me/password', input);
  },

  listAddresses() {
    return apiClient.get<ApiSuccess<Address[]>>('/me/addresses');
  },

  createAddress(input: AddressInput) {
    return apiClient.post<ApiSuccess<Address>>('/me/addresses', input);
  },

  updateAddress(id: string, input: AddressInput) {
    return apiClient.patch<ApiSuccess<Address>>(`/me/addresses/${id}`, input);
  },

  deleteAddress(id: string) {
    return apiClient.delete<ApiSuccess<{ deleted: boolean }>>(`/me/addresses/${id}`);
  },

  setDefaultAddress(id: string) {
    return apiClient.patch<ApiSuccess<Address>>(`/me/addresses/${id}/default`);
  },
};
