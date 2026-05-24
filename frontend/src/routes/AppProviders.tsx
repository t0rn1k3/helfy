import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import type { ReactNode } from 'react';

import { router } from '@/routes/router';

const queryClient = new QueryClient({
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
        {children}
        <Toaster richColors position="top-right" theme="dark" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}
