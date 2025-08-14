import { Outlet, redirect } from "react-router-dom";
import { useUiStore } from "../../store/useUiStore";

export default function AuthLayout() {
  const { darkMode: isDark } = useUiStore();

  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/auth-bg.jpeg')`, // Path to your image
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div> {/* Overlay */}
      </div>

      {/* Right-aligned form */}
      <div className="relative z-10 flex justify-end items-center min-h-screen px-4">
        <div
          className={`w-full max-w-md rounded-xl shadow-lg p-8 ${
            isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
