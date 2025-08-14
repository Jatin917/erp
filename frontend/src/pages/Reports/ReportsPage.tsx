import Section from "../../components/common/Section";
import PermissionGuard from "../../components/layout/PermissionGuard";
import Button from "../../components/common/Button";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <Section
        title="Reports"
        action={
          <PermissionGuard allowPermissions={["EXPORT_REPORTS"]}>
            <Button variant="outline">Download CSV</Button>
          </PermissionGuard>
        }
      />
      {/* Put your charts and tables here */}
    </div>
  );
}
