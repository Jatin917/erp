import { useState } from "react";

interface SchoolDetailsFormProps {
  onNext: () => void;
  updateField: (
    field: "schoolName" | "address" | "logo" | "currentSession",
    value: any
  ) => void;
  schoolNameProp: string;
  logo: File | null;
  addressProp: string;
  currentSessionProp: string;
}

export default function SchoolDetailsForm({
  onNext,
  updateField,
  schoolNameProp,
  logo,
  addressProp,
  currentSessionProp,
}: SchoolDetailsFormProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLogo, setSchoolLogo] = useState<File | null>(logo);
  const [address, setAddress] = useState(addressProp);
  const [currentSession, setCurrentSession] = useState(currentSessionProp);

  // Check if all required fields are filled
  const isStep1Complete =
    schoolName.trim() !== "" &&
    address.trim() !== "" &&
    currentSession.trim() !== "" &&
    schoolLogo !== null;

  const handleNext = () => {
    updateField("schoolName", schoolName);
    updateField("logo", schoolLogo);
    updateField("address", address);
    updateField("currentSession", currentSession);

    onNext();
  };

  return (
    <div className="space-y-4">
      {/* School Name */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          School Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          placeholder="Enter school name"
          required
        />
      </div>

      {/* School Logo */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          School Logo <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          onChange={(e) => setSchoolLogo(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500"
          accept="image/*"
          required
        />
        {schoolLogo && (
          <p className="text-sm text-green-600 mt-1">
            ✅ Logo selected: {schoolLogo.name}
          </p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          placeholder="Enter school address"
          rows={3}
          required
        />
      </div>

      {/* Current Session */}
      <div>
        <label className="block text-sm font-medium mb-1 dark:text-gray-200">
          Current Academic Session <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={currentSession}
          onChange={(e) => setCurrentSession(e.target.value)}
          className="w-full border px-3 py-2 rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
          placeholder="e.g. 2025-26"
          required
        />
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!isStep1Complete}
        className={`px-6 py-2 rounded-lg transition-colors ${
          isStep1Complete
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isStep1Complete ? "Next" : "Complete all fields to continue"}
      </button>
    </div>
  );
}
