import { Menu, Bell, UserCircle, Sun, Moon, Monitor } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { SchoolSelect } from "@/components/school/schoolSelector";
import { useSchoolStore } from "@/store/schoolStore";
import { useFetchSchools } from "@/hooks/schoolQuery";

export default function Topbar() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const { darkMode, resetTheme } = useUiStore();
  const { user, logout } = useAuthStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const {schools} = useSchoolStore();
  const {isLoading} = useFetchSchools();


  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    if (theme === 'system') {
      resetTheme();
    } else {
      useUiStore.getState().setDarkMode(theme === 'dark');
    }
    setShowThemeMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-background border-b bg-background">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">

        {/* Left: Sidebar + Branch Select */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-accent text-muted-foreground transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          {schools.length>1 && <SchoolSelect isLoading={isLoading} />}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">

          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-xl hover:bg-accent transition-colors text-muted-foreground"
              title="Change theme"
            >
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-popover border rounded-lg shadow-md z-50">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                      !darkMode
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/30"
                    }`}
                  >
                    <Sun className="h-4 w-4" /> Light
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                      darkMode
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/30"
                    }`}
                  >
                    <Moon className="h-4 w-4" /> Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm hover:bg-accent/30"
                  >
                    <Monitor className="h-4 w-4" /> System
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-card shadow-sm">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for theme menu */}
      {showThemeMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowThemeMenu(false)}
        />
      )}
    </header>
  )
}