import { type ReactNode } from "react";
import { useAuthStore } from "../../store/authStore";
import type { Role, Permission } from "../../api/types";

export default function PermissionGuard({
  allowRoles,
  allowPermissions,
  children,
  fallback = null,
}: {
  allowRoles?: Role[];
  allowPermissions?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { roles, permissions } = useAuthStore();

  const roleOK = !allowRoles || allowRoles.some((r) => roles.includes(r));
  const permOK = !allowPermissions || allowPermissions.some((p) => permissions.includes(p));

  if (roleOK && permOK) return <>{children}</>;
  return <>{fallback}</>;
}
