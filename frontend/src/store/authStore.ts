import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserDTO, Role, Permission } from "../api/types";

type AuthState = {
  token: string | null;
  user: UserDTO | null;
  roles: Role[];
  permissions: Permission[];
  login: (payload: { token: string; user: UserDTO }) => void;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  hasPermission: (perm: Permission) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      roles: [],
      permissions: [],
      login: ({ token, user }) => {
        // take roles and permissions exactly as provided by backend
        set({
          token,
          user,
          roles: user.roles,
          permissions: user.permissions || [],
        });
      },
      logout: () => set({ token: null, user: null, roles: [], permissions: [] }),
      hasRole: (role) => get().roles.includes(role),
      hasPermission: (perm) => get().permissions.includes(perm),
    }),
    { name: "auth-store" }
  )
);
