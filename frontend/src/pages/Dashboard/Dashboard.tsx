import Section from "../../components/common/Section";
export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Section title="Dashboard Overview" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Put your StatCard components here */}
        <div className="rounded-2xl border border-primary bg-card p-4">
          <div className="text-sm opacity-70 text-secondary">Total Students</div>
          <div className="text-2xl font-semibold text-primary">1,284</div>
        </div>
      </div>
    </div>
  );
}
