import React, { useState, useEffect } from "react";
import { roleDefaults } from "../../lib/permission";
import { useUiStore } from "../../store/useUiStore";
import { useLogin } from "../../hooks/useAuth";

export default function LoginPage() {
  const { darkMode: isDarkMode } = useUiStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [setupKey, setSetupKey] = useState("");

  const roleOptions = Object.keys(roleDefaults);
  const { mutate: login } = useLogin();
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { email, password, role };
    if (role === "SUPERADMIN") {
      data.setupKey = setupKey;
    }
    login(data);
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-6">
        Login with your email
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white  focus:outline-none focus:ring-0 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <select
          className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        {role === "SUPERADMIN" && (
          <input
            type="text"
            placeholder="Setup Key"
            className="w-full px-4 py-2 border rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={setupKey}
            onChange={(e) => setSetupKey(e.target.value)}
          />
        )}

        <div className="text-right">
          <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
            Forgot Password?
          </a>
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition`}
        >
          Login
        </button>
      </form>
    </>
  );
}
