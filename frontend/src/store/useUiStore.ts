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
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      darkMode: true,
      sidebarOpen: true,

      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebar: (open) => set(() => ({ sidebarOpen: open })),
      setDarkMode: (enabled) => set(() => ({ darkMode: enabled })),
    }),
    {
      name: "ui-store", // localStorage key
    }
  )
);
