'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { useState } from 'react';

import { getAccessToken } from '@package/store/expo';
import { trpc } from './client';
import { queryClientNative } from './query-client';

export function TrpcNativeProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({ enabled: () => process.env.NODE_ENV === 'development' }),
        httpBatchLink({
          url: process.env.EXPO_PUBLIC_HTTP_URL as string,
          async headers() {
            const token = await getAccessToken();
            console.log('expo secure token', token);
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={client} queryClient={queryClientNative}>
      <QueryClientProvider client={queryClientNative}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
