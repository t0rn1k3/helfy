import { isAxiosError } from 'axios';

import type { ApiError } from '@helfy/shared';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;

    if (data?.success === false && data.error) {
      return data.error;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}

export { isAxiosError };
