'use client';

import { trpc } from '@package/api';
import { signOut } from 'next-auth/react';

export const useLogout = () => {
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async (reason: 'manual' | 'expired' = 'manual') => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: any) {
      console.warn('Silent logout', error.message || 'An error occurred during logout');
    } finally {
      const toastType = reason === 'manual' ? 'logout_success' : 'session_expired';

      await signOut({
        callbackUrl: `/auth/sign-in?toast=${toastType}`,
        redirect: true,
      });
    }
  };

  return { handleLogout, isLoading: logoutMutation.isPending };
};
