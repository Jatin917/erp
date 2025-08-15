import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './router/appRouter'
import { useDarkMode } from './hooks/useDarkMode'

function App() {
  const queryClient = new QueryClient();
  
  // Use the new dark mode hook for Tailwind v4
  useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App