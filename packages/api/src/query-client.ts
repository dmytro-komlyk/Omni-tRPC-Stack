import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 1000 } },
});

export const queryClientNative = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 1000 } },
});
