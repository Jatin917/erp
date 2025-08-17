import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  let token: string | null = null;

  try {
    const stored = localStorage.getItem("auth-store");
    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed?.state?.token ?? null;
    }
  } catch (e) {
    console.error("Failed to parse auth-store:", e);
  }

  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
