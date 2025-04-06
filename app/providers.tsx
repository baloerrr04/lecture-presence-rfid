'use client';

import { TRPCProvider } from '@/lib/trpc/client';
import { Toaster } from 'sonner';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: {children: React.ReactNode}) {
  return (
    <SessionProvider>
      <TRPCProvider>
          {children}
          <Toaster />
      </TRPCProvider>
    </SessionProvider>
  );
}