import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { persist, PersistStorage, StorageValue } from 'zustand/middleware';

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
  sessionToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  setHasHydrated: (state: boolean) => void;
  login: ({
    user,
    access,
    refresh,
    session,
  }: {
    user: User;
    access: string;
    refresh: string;
    session: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const secureStorage: PersistStorage<AuthState> = {
  getItem: async (name: string): Promise<StorageValue<AuthState> | null> => {
    const data = await SecureStore.getItemAsync(name);
    if (!data) return null;
    return JSON.parse(data);
  },
  setItem: async (name: string, value: StorageValue<AuthState>): Promise<void> => {
    await SecureStore.setItemAsync(name, JSON.stringify(value));
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      setHasHydrated: (state) => set({ isHydrated: state }),

      login: async ({ user, access, refresh, session }) => {
        try {
          set({ isLoading: true, error: null });

          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            sessionToken: session,
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

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            sessionToken: null,
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
          const { accessToken, sessionToken } = get();
          if (accessToken && sessionToken) {
            set({
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false, isAuthenticated: false });
          }
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-expo',
      storage: secureStorage,
      partialize: (state) =>
        ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          sessionToken: state.sessionToken,
          isAuthenticated: state.isAuthenticated,
        }) as AuthState,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
