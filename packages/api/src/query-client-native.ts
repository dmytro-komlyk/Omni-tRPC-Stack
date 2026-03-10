import { useAuthStore } from '@package/store/auth-native';
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

const handleAuthError = (error: any) => {
  if (error?.data?.code === 'UNAUTHORIZED' || error?.shape?.code === -32001) {
    const { logout, sessionToken } = useAuthStore.getState();

    if (!sessionToken) {
      logout();
      return;
    }

    console.warn('Session expired on Mobile');
    logout();
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleAuthError(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleAuthError(error),
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.data?.code === 'UNAUTHORIZED') return false;
        return failureCount < 2;
      },
    },
  },
});
