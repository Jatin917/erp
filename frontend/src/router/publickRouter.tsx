import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { JSX } from "react";

export default function PublicRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuthStore();
  
  if (token) {
    return <Navigate to="/" replace />; // already logged in → go home
  }

  return children;
}
