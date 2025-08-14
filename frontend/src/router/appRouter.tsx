
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./privateRouter";
import AppShell from "../components/layout/AppShell";
import Dashboard from "../pages/Dashboard/Dashboard";
import StudentsPage from "../pages/Students/StudentsPage";
import ClassesPage from "../pages/Class/ClassPage";
import FeesPage from "../pages/Fees/FeesPage";
import SessionsPage from "../pages/Sessions/SessionsPage";
import UsersPage from "../pages/Users/UsersPage";
import ReportsPage from "../pages/Reports/ReportsPage";
import SettingsPage from "../pages/Settings/SettingsPage";
import AuthLayout from "../pages/auth/authLayout";
import PublicRoute from "./publickRouter";
import LoginPage from "../pages/auth/login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
          } />
        </Route>

        {/* protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
