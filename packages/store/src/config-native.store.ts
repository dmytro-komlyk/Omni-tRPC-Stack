import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
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
          id = Crypto.randomUUID();
          set({ clientId: id });
        }

        return id;
      },
    }),
    {
      name: 'app-config',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
