import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = process.env.APP_HOSTNAME as string;

export interface ThemeState {
  theme: string;
  setTheme: (value: string) => void;
  _hasHydrated: boolean;
}

export type ThemePersistedState = Pick<ThemeState, 'theme'>;

const cookieThemeStorage = {
  getItem: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = Cookies.get(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    if (typeof document === 'undefined') return;
    Cookies.set(name, value, {
      domain: cookieDomain,
      path: '/',
      expires: 365,
      secure: isProduction,
      sameSite: 'lax',
    });
  },
  removeItem: (name: string) => {
    if (typeof document === 'undefined') return;
    Cookies.remove(name, { path: '/', domain: cookieDomain });
  },
};

export const useThemeCookieStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (value: string) => {
        set({ theme: value });
      },
      _hasHydrated: false,
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => cookieThemeStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
          document.documentElement.classList.toggle('dark', state.theme === 'dark');
        }
      },
    }
  )
);

interface UIState {
  isSideBarOpen: boolean;
  setSideBarOpen: (_value: boolean) => void;
  chatBot: 'IDLE' | 'TYPING';
  setChatBot: (_value: 'IDLE' | 'TYPING') => void;
  _hasHydrated: boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSideBarOpen: true,
      setSideBarOpen: (value: boolean) => set({ isSideBarOpen: value }),
      chatBot: 'IDLE',
      setChatBot: (value: 'IDLE' | 'TYPING') => set({ chatBot: value }),
      _hasHydrated: false,
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isSideBarOpen: state.isSideBarOpen,
        chatBot: state.chatBot,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
