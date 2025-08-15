import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;

  // Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  resetTheme: () => void;
  getSystemPreference: () => boolean;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      darkMode: false, // Default to light mode
      sidebarOpen: true,

      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebar: (open) => set(() => ({ sidebarOpen: open })),
      setDarkMode: (enabled) => set(() => ({ darkMode: enabled })),
      
      resetTheme: () => {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        set(() => ({ darkMode: systemPrefersDark }));
      },
      
      getSystemPreference: () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      },
    }),
    {
      name: "ui-store", // localStorage key
    }
  )
);
