import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deleteTokens, getAccessToken, getRefreshToken, saveTokens } from './secure.store';

interface User {
  id: string;
  email: string | null;
  nickName: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: ({
    user,
    access,
    refresh,
  }: {
    user: User;
    access: string;
    refresh: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const secureStorage = {
  getItem: async (name: string) => SecureStore.getItemAsync(name),
  setItem: async (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: async (name: string) => SecureStore.deleteItemAsync(name),
};

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async ({ user, access, refresh }) => {
        try {
          set({ isLoading: true, error: null });
          await saveTokens(access, refresh);
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await deleteTokens();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const accessToken = await getAccessToken();
          const refreshToken = await getRefreshToken();

          if (accessToken) {
            set({
              accessToken,
              refreshToken: refreshToken || null,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-expo',
      storage: {
        getItem: async (name) => {
          const value = await secureStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await secureStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await secureStorage.removeItem(name);
        },
      },
      partialize: (state) =>
        ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }) as AuthState,
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Rehydration error:', error);
          }
          if (state) {
            state.isLoading = false;
          }
        };
      },
    }
  )
);
