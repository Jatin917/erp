import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './router/appRouter'
import { useDarkMode } from './hooks/useDarkMode'
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
  const queryClient = new QueryClient();
  const {login} = useAuthStore();
  useEffect(()=>{
    if(!localStorage.getItem("auth-store")){
      return;
    }
    const authStore = JSON.parse(localStorage.getItem("auth-store"));
    const token = authStore.state.token;
    const user = authStore.state.user;
    if(token && user){
      login({token, user});
    }
  },[])
  // Use the new dark mode hook for Tailwind v4
  useDarkMode();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App