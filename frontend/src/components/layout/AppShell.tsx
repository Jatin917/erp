import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useUiStore } from "../../store/useUiStore";

export default function AppShell() {
  const { sidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{/* page content */}<Outlet /></main>
        </div>
      </div>
    </div>
  );
}
