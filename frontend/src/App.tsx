import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './router/appRouter'
import { useUiStore } from './store/useUiStore'
import { useEffect } from 'react'

function App() {
  const queryClient = new QueryClient();
  const { darkMode } = useUiStore();
  
  // Apply dark mode to HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    console.log('Dark mode state:', darkMode); // Debug log
    console.log('Current HTML classes:', root.classList.toString()); // Debug log
    
    if (darkMode) {
      root.classList.add('dark');
      console.log('Added dark class to HTML'); // Debug log
      console.log('HTML classes after adding dark:', root.classList.toString()); // Debug log
    } else {
      root.classList.remove('dark');
      console.log('Removed dark class from HTML'); // Debug log
      console.log('HTML classes after removing dark:', root.classList.toString()); // Debug log
    }
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App
