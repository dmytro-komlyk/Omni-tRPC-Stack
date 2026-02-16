import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { AppRouter } from 'server/src/domain/trpc/trpc.router';

export const getRemoteServerClient = (sessionToken?: string | null) => {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: process.env.APP_HTTP_URL as string,
        headers() {
          return {
            ...(sessionToken ? { 'x-session-token': sessionToken } : {}),
          };
        },
      }),
    ],
  });
};
