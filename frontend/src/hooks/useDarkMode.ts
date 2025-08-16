import { useEffect, useState } from 'react';
import { useUiStore } from '../store/useUiStore';

export const useDarkMode = () => {
  const { darkMode, setDarkMode, resetTheme } = useUiStore();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    if (mounted) {
      const savedTheme = localStorage.getItem('ui-store');
      if (!savedTheme) {
        // Auto-detect system preference
        resetTheme();
      }
    }
  }, [mounted, resetTheme]);

  // Apply theme changes
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      
      if (darkMode) {
        root.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [darkMode, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (mounted) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = () => {
        // Only auto-update if user hasn't manually set a preference
        const savedTheme = localStorage.getItem('ui-store');
        if (!savedTheme) {
          resetTheme();
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mounted, resetTheme]);

  return {
    darkMode,
    setDarkMode,
    resetTheme,
    mounted,
    isSystem: !localStorage.getItem('ui-store'),
  };
};
