import { useState } from "react";

interface SchoolDetailsFormProps {
  onNext: () => void;
  updateField: (field: "schoolName" | "address" | "logo", value: any) => void;
  schoolNameProp:string;
  logo:File | null;
  addressProp:string;
}

export default function SchoolDetailsForm({ onNext, updateField , schoolNameProp, logo, addressProp}: SchoolDetailsFormProps) {
  const [schoolName, setSchoolName] = useState(schoolNameProp);
  const [schoolLogo, setSchoolLogo] = useState<File | null>(logo);
  const [address, setAddress] = useState(addressProp);

  // Check if all required fields are filled
  const isStep1Complete = schoolName.trim() !== "" && address.trim() !== "" && schoolLogo !== null;

  const handleNext = () => {
    // update global state via updateField callback
    updateField("schoolName", schoolName);
    updateField("logo", schoolLogo);
    updateField("address", address);

    onNext();
  };

  return (
    <div className="space-y-4">
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
          <p className="text-sm text-green-600 mt-1">✅ Logo selected: {schoolLogo.name}</p>
        )}
      </div>

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
