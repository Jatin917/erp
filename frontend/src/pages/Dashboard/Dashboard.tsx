import Section from "../../components/common/Section";
import Tag from "../../components/common/Tag";
import Button from "../../components/common/Button";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Section title="Dashboard Overview" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Put your StatCard components here */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-sm opacity-70">Total Students</div>
          <div className="text-2xl font-semibold">1,284</div>
        </div>
      </div>
    </div>
  );
}
