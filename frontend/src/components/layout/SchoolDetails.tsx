import { useState } from "react";

export default function SchoolDetailsForm({ onNext, updateField }) {
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<File | null>(null);
  const [address, setAddress] = useState("");

  const handleNext = () => {
    // update global state via updateField callback
    updateField("schoolName", schoolName);
    updateField("schoolLogo", schoolLogo);
    updateField("address", address);

    onNext();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          School Name
        </label>
        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          School Logo
        </label>
        <input
          type="file"
          onChange={(e) => setSchoolLogo(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
        />
      </div>

      <button
        onClick={handleNext}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Next
      </button>
    </div>
  );
}
