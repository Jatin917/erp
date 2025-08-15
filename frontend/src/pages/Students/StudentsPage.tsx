import { useQuery } from "@tanstack/react-query";
import { fetchStudents, type StudentRow } from "../../services/studentApi";
import Section from "../../components/common/Section";
import DataTable from "../../components/common/DataTable";
import Tag from "../../components/common/Tag";
import Button from "../../components/common/Button";
import PermissionGuard from "../../components/layout/PermissionGuard";

export default function StudentsPage() {
  const { data = [], isLoading } = useQuery<StudentRow[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  });

  return (
    <div className="space-y-4">
      <Section
        title="Students"
        action={
          <div className="flex items-center gap-2">
            <PermissionGuard allowPermissions={["CREATE_STUDENT"]}>
              <Button>Add Student</Button>
            </PermissionGuard>
            <PermissionGuard allowPermissions={["BULK_UPLOAD_STUDENTS"]}>
              <a className="text-sm underline hover:text-accent transition-colors" href="/templates/students.csv" download>Download CSV Template</a>
            </PermissionGuard>
          </div>
        }
      />
      <PermissionGuard allowPermissions={["BULK_UPLOAD_STUDENTS"]}>
        <div className="mb-3">
          {/* inline bulk upload */}
          {/** import StudentBulkUpload lazily if you prefer */}
          {/* <StudentBulkUpload /> */}
        </div>
      </PermissionGuard>

      {isLoading ? (
        <div className="rounded-xl border border-primary bg-card p-4 text-primary">Loading…</div>
      ) : (
        <DataTable<StudentRow>
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
            { key: "className", header: "Class" },
            { key: "rollNo", header: "Roll No" },
            {
              key: "status",
              header: "Status",
              render: (v) => <Tag tone={v === "Active" ? "green" : "red"}>{v}</Tag>,
            },
          ]}
          data={data}
        />
      )}
    </div>
  );
}
