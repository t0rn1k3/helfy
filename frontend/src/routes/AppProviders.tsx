import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import type { ReactNode } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';
import { AuthBootstrap } from '@/hooks/use-auth';
import { router } from '@/routes/router';

function handleQueryMetaError(error: unknown, meta: Record<string, unknown> | undefined) {
  if (meta?.skipGlobalErrorToast) {
    return;
  }

  const message =
    (typeof meta?.errorMessage === 'string' ? meta.errorMessage : undefined) ??
    getApiErrorMessage(error);

  toast.error(message);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleQueryMetaError(error, query.meta);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleQueryMetaError(error, mutation.meta);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children?: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  if (children) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}
