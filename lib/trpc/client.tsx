// /lib/trpc/client.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import {useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type AppRouter } from './router';

export const trpc = createTRPCReact<AppRouter>();

// Provider Component
export function TRPCProvider({ children }: {children: React.ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}