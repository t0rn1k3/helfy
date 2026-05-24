import type {
  ApiSuccess,
  AuthTokens,
  LoginInput,
  SignupInput,
} from '@helfy/shared';

import { apiClient } from './client';

export const authApi = {
  register(input: SignupInput) {
    return apiClient.post<ApiSuccess<AuthTokens>>('/auth/register', input);
  },

  login(input: LoginInput) {
    return apiClient.post<ApiSuccess<AuthTokens>>('/auth/login', input);
  },

  refresh() {
    return apiClient.post<ApiSuccess<AuthTokens>>('/auth/refresh');
  },

  logout() {
    return apiClient.post<ApiSuccess<{ loggedOut: boolean }>>('/auth/logout');
  },

  logoutAll() {
    return apiClient.post<ApiSuccess<{ loggedOut: boolean }>>('/auth/logout-all');
  },
};
