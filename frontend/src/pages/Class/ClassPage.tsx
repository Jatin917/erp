import Section from "../../components/common/Section";
import Button from "../../components/common/Button";
import PermissionGuard from "../../components/layout/PermissionGuard";

export default function ClassesPage() {
  return (
    <div className="space-y-4">
      <Section
        title="Classes"
        action={
          <PermissionGuard allowPermissions={["CREATE_CLASS"]}>
            <Button variant="outline">Add Class</Button>
          </PermissionGuard>
        }
      />
      {/* Your class cards list goes here */}
    </div>
  );
}
