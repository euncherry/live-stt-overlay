import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { FONT_SIZE } from '@/constants/layout';
import type { ThemeName } from '@/constants/theme';

interface SettingsState {
  fontSize: number;
  theme: ThemeName;
  setFontSize: (n: number) => void;
  setTheme: (t: ThemeName) => void;
}

const clampFontSize = (n: number) =>
  Math.round(Math.min(FONT_SIZE.MAX, Math.max(FONT_SIZE.MIN, n)));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: FONT_SIZE.DEFAULT,
      theme: 'light',
      setFontSize: (n) => set({ fontSize: clampFontSize(n) }),
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ fontSize: s.fontSize, theme: s.theme }),
    },
  ),
);
