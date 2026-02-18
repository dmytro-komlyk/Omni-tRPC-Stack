'use client';

import { useConfigStore } from '@package/store/config';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useSession } from 'next-auth/react';

import { useState } from 'react';
import { trpc } from './client';
import { queryClient } from './query-client';

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { ensureClientId } = useConfigStore();

  const [client] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === 'development' }),
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_SERVER_TRPC_URL as string,
          headers() {
            const clientId = ensureClientId();

            return {
              ...(session?.user ? { 'x-session-token': session?.user?.sessionToken } : {}),
              'x-client-id': clientId,
            };
          },
          async fetch(url, options) {
            const response = await fetch(url, {
              ...options,
              credentials: 'include',
              signal: options?.signal ?? null,
            });
            if (response.status === 401 && typeof window !== 'undefined') {
              // Можно добавить логику signOut() из next-auth/react здесь
            }
            return response;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
