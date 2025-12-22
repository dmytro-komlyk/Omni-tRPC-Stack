import * as storage from '@package/store/expo';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await storage.isLoggedIn();
    setIsAuthenticated(token);
    setIsLoading(false);
  };

  const login = async (access: string, refresh: string) => {
    await storage.saveTokens(access, refresh);
    setIsAuthenticated(true);
    router.replace('/');
  };

  const logout = async () => {
    await storage.deleteTokens();
    setIsAuthenticated(false);
    router.replace('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
