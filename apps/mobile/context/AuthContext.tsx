'use client';

import { useAuthStore } from '@package/store/auth-native';
import { createContext, useContext, useEffect } from 'react';

type AuthContextType = ReturnType<typeof useAuthStore>;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  console.log('AuthProvider - isAuthenticated:', store.isAuthenticated);

  useEffect(() => {
    store.checkAuth();
  }, []);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
