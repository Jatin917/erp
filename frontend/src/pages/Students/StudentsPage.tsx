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
              <a className="text-sm underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors" href="/templates/students.csv" download>Download CSV Template</a>
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
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-slate-900 dark:text-slate-100">Loading…</div>
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
