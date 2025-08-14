// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";


function PrivateRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) {
  const { token, user } = useLogin();
  
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes */}
        {/* <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/students" element={<Students />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/reports" element={<Reports />} /> */}

          {/* Admin Only */}
          {/* <Route
            path="/settings/roles"
            element={
              <PrivateRoute roles={["SUPERADMIN"]}>
                <Roles />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings/permissions"
            element={
              <PrivateRoute roles={["SUPERADMIN"]}>
                <Permissions />
              </PrivateRoute>
            }
          />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}
