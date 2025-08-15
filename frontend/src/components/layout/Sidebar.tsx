import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { LayoutDashboard, Users, School, DollarSign, Calendar, Shield, FileText, Settings, X, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/useUiStore";
import PermissionGuard from "./PermissionGuard";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { to: "/school", label: "School", icon: School, roles: ["SUPERADMIN", "DIRECTOR", "PRINCIPAL","TEACHER","SCHOOL_ADMIN","RECEPTIONIST"] },
  { to: "/students", label: "Students", icon: Users, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","TEACHER","SCHOOL_ADMIN","RECEPTIONIST"] },
  { to: "/classes", label: "Classes", icon: School, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","TEACHER","SCHOOL_ADMIN"] },
  { to: "/fees", label: "Fees", icon: DollarSign, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","ACCOUNTANT","SCHOOL_ADMIN"] },
  { to: "/sessions", label: "Sessions", icon: Calendar, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","SCHOOL_ADMIN"] },
  { to: "/users", label: "Users", icon: Shield, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","SCHOOL_ADMIN"] },
  { to: "/reports", label: "Reports", icon: FileText, roles: ["SUPERADMIN","DIRECTOR","PRINCIPAL","ACCOUNTANT","SCHOOL_ADMIN"] },
  { to: "/settings", label: "Settings", icon: Settings, roles: null },
];

export default function Sidebar() {
  const { roles } = useAuthStore();
  const { sidebarOpen, setSidebar } = useUiStore();
  const loc = useLocation();

  const items = useMemo(
    () => nav.filter((n) => !n.roles || n.roles.some((r) => roles.includes(r as any))),
    [roles]
  );

  return (
    <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed z-40 h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-r border-slate-200 dark:border-slate-800 p-3 transition-transform ease-in-out md:static md:translate-x-0`}>
      <div className="flex items-center justify-between mb-2">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">SE</span>
          <span>School ERP</span>
        </Link>
        <button onClick={() => setSidebar(false)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-2 space-y-1">
        {items.map((n) => {
          const active = loc.pathname === n.to;
          const Icon = n.icon;
          return (
            <Link key={n.to} to={n.to} className={`group flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 ${active ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" : ""}`}>
              <Icon className="h-5 w-5 opacity-80" />
              <span className="font-medium">{n.label}</span>
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
            </Link>
          );
        })}
      </nav>

      {/* Example: a fee widget visible only to roles with fee summary permission */}
      <PermissionGuard allowPermissions={["VIEW_FEE_SUMMARY"]}>
        <div className="mt-6 p-3 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs uppercase tracking-wider opacity-60 text-slate-600 dark:text-slate-400">Quick Stats</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="opacity-60 text-slate-600 dark:text-slate-400">Students</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">1,284</div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="opacity-60 text-slate-600 dark:text-slate-400">Due (₹)</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">3.2L</div>
            </div>
          </div>
        </div>
      </PermissionGuard>
    </aside>
  );
}
