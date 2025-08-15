import { Menu, Bell, UserCircle, Sun, Moon } from "lucide-react";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/authStore";

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { darkMode, toggleDarkMode } = useUiStore();
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-b border-slate-200/70 dark:border-slate-800">
      <div className="flex items-center gap-3 p-3 md:p-4">
        <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <UserCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <span className="text-sm text-slate-900 dark:text-slate-100">{user?.name}</span>
          <button onClick={logout} className="text-xs opacity-70 hover:opacity-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">Logout</button>
        </div>
      </div>
    </header>
  );
}
