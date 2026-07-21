import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'original', // 'original', 'leetcode', 'light'
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage', // saves to local storage
    }
  )
);
