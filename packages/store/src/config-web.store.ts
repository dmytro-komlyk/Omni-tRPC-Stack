import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ConfigState {
  clientId: string | null;
  ensureClientId: () => string;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      clientId: null,

      ensureClientId: () => {
        let id = get().clientId;

        if (!id) {
          id = crypto.randomUUID();
          set({ clientId: id });
        }

        if (typeof window !== 'undefined') {
          document.cookie = `x-client-id=${id}; path=/; max-age=31536000; SameSite=Lax`;
        }

        return id;
      },
    }),
    {
      name: 'app-config',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
