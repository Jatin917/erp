import Section from "../../components/common/Section";
import DataTable from "../../components/common/DataTable";
import Tag from "../../components/common/Tag";
import Button from "../../components/common/Button";
import PermissionGuard from "../../components/layout/PermissionGuard";

export default function UsersPage() {
  const rows = [
    { id: 1, name: "Neha Gupta", role: "PRINCIPAL", branch: "Main" },
    { id: 2, name: "Imran Ali", role: "TEACHER", branch: "North" },
  ];
  return (
    <div className="space-y-4">
      <Section
        title="Users & Roles"
        action={
          <PermissionGuard allowRoles={["SUPERADMIN","DIRECTOR","PRINCIPAL","SCHOOL_ADMIN"]}>
            <Button variant="outline">Invite User</Button>
          </PermissionGuard>
        }
      />
      <DataTable
        columns={[
          { key: "name", header: "Name" },
          { key: "role", header: "Role", render: (v) => <Tag tone="blue">{v}</Tag> },
          { key: "branch", header: "Branch" },
        ]}
        data={rows}
      />
    </div>
  );
}
