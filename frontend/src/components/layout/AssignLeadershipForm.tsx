// components/AssignLeadershipForm.tsx
import AssignRoleCard from "./AssignRoleCard";

export default function AssignLeadershipForm({ onBack, onNext, onVerifyClick, director, principal }) {
  return (
    <div className="space-y-6">
      {["Director", "Principal"].map((role) => (
        <AssignRoleCard key={role} role={role} onVerifyClick={onVerifyClick} director={director} principal={principal} />
      ))}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}
