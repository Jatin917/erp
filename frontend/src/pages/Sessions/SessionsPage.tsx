import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import Tag from "../../components/common/Tag";
import PermissionGuard from "../../components/layout/PermissionGuard";

export default function SessionsPage() {
  const items = [
    { id: 1, name: "2024–25", status: "COMPLETED" },
    { id: 2, name: "2025–26", status: "ACTIVE" },
    { id: 3, name: "2026–27", status: "UPCOMING" },
  ];
  return (
    <div className="space-y-4">
      <Section
        title="Academic Sessions"
        action={
          <PermissionGuard allowPermissions={["CREATE_SESSION"]}>
            <Button variant="outline">Create Session</Button>
          </PermissionGuard>
        }
      />
      <div className="grid gap-3">
        {items.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div className="font-semibold">{s.name}</div>
            <Tag tone={s.status === "ACTIVE" ? "green" : s.status === "UPCOMING" ? "blue" : "slate"}>{s.status}</Tag>
            <div className="ml-auto flex items-center gap-2">
              <PermissionGuard allowPermissions={["LOCK_SESSION"]} fallback={null}>
                {s.status === "ACTIVE" && <Button variant="outline" size="sm" className="mr-2">Lock</Button>}
              </PermissionGuard>
              <PermissionGuard allowPermissions={["PROMOTE_STUDENTS"]} fallback={null}>
                {s.status === "COMPLETED" && <Button size="sm">Promote</Button>}
              </PermissionGuard>
              <PermissionGuard allowPermissions={["EDIT_SESSION"]} fallback={null}>
                {s.status === "UPCOMING" && <Button size="sm">Activate</Button>}
              </PermissionGuard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
