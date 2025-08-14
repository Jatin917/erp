import Section from "../../components/common/Section";
import DataTable from "../../components/common/DataTable";
import Tag from "../../components/common/Tag";
import Button from "../../components/common/Button";
import PermissionGuard from "../../components/layout/PermissionGuard";

export default function FeesPage() {
  const rows = [
    { id: 1, name: "Aarav Sharma", className: "Grade 6", head: "Tuition", amount: 15000, paid: 12000, mode: "UPI" },
  ];
  return (
    <div className="space-y-4">
      <Section
        title="Fee Management"
        action={
          <PermissionGuard allowPermissions={["RECORD_FEE_TRANSACTION"]}>
            <Button>New Transaction</Button>
          </PermissionGuard>
        }
      />
      <PermissionGuard allowPermissions={["VIEW_FEE_SUMMARY"]}>
        <DataTable
          columns={[
            { key: "name", header: "Student" },
            { key: "className", header: "Class" },
            { key: "head", header: "Head" },
            { key: "amount", header: "Payable", render: (v) => `₹ ${v.toLocaleString()}` },
            { key: "paid", header: "Paid", render: (v) => `₹ ${v.toLocaleString()}` },
            { key: "mode", header: "Mode", render: (v) => <Tag tone="slate">{v}</Tag> },
          ]}
          data={rows}
        />
      </PermissionGuard>
    </div>
  );
}
