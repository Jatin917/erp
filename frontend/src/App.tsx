import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './router/appRouter'

function App() {

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App
