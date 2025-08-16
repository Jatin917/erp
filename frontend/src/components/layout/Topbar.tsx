import { Menu, Bell, UserCircle, Sun, Moon, Monitor } from "lucide-react";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { darkMode, resetTheme } = useUiStore();
  const { user, logout } = useAuthStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      resetTheme();
    } else {
      useUiStore.getState().setDarkMode(theme === 'dark');
    }
    setShowThemeMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-primary bg-secondary">
      <div className="flex items-center gap-3 p-3 md:p-4">
        <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-card text-secondary transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        
        {/* Theme Toggle with Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl hover:bg-card transition-colors text-secondary"
            title="Change theme"
          >
            {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          {/* Theme Menu */}
          {showThemeMenu && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-primary rounded-lg shadow-lg z-50">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !darkMode ? 'bg-accent text-white' : 'hover:bg-card text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    darkMode ? 'bg-accent text-white' : 'hover:bg-card text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </div>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-card text-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="p-2 rounded-xl hover:bg-card text-secondary transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 p-2 rounded-xl border border-primary bg-card">
          <UserCircle className="h-5 w-5 text-secondary" />
          <span className="text-sm text-primary">{user?.name}</span>
          <button onClick={logout} className="text-xs opacity-70 hover:opacity-100 text-secondary hover:text-primary transition-colors">Logout</button>
        </div>
      </div>
      
      {/* Click outside to close theme menu */}
      {showThemeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowThemeMenu(false)}
        />
      )}
    </header>
  );
}
