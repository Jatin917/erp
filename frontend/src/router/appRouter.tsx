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
import SchoolCreationPage from "../pages/School/SchoolCreationPage";
import StudentList from "../pages/Students/StudentList";
import StudentDetails from "../pages/Students/StudentDetail";
import StudentUpload from "../pages/Students/StudentUpload";
// import ChangePasswordPage from "../pages/auth/changePassword"; // ⬅️ add this

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          {/* <Route
            path="/change-password"
            element={
              <PublicRoute>
                <ChangePasswordPage />
              </PublicRoute>
            }
          /> */}
        </Route>

        {/* Protected routes */}
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
          <Route path="students/list" element={<StudentList />} />
          <Route path="students/details/:id" element={<StudentDetails />} />
          <Route path="students/upload" element={<StudentUpload />} />

          <Route path="classes" element={<ClassesPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="fee-transaction" element={<FeesPage />} />
          <Route path="school" element={<SchoolCreationPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
