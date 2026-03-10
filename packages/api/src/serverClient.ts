import { createTRPCProxyClient, httpBatchLink, loggerLink } from '@trpc/client';
import { AppRouter } from 'server/src/domain/trpc/trpc.router';

export const getRemoteServerClient = (
  sessionToken?: string | null,
  headers?: Record<string, string | undefined>
) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({ enabled: () => process.env.NODE_ENV === 'development' }),
      httpBatchLink({
        url: process.env.APP_HTTP_URL as string,
        headers() {
          return {
            ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
            ...headers,
          };
        },
      }),
    ],
  });
};
