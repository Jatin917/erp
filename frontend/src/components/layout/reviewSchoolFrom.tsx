// components/layout/ReviewSchoolForm.tsx

interface RoleData {
  name?: string;
  email?: string;
  phone?: string;
  isVerifiedEmail?: boolean;
  isVerifiedPhone?: boolean;
}

interface ReviewSchoolFormProps {
  schoolName: string;
  address: string;
  currentSession: string;
  logo?: File | string; // Allow both File and URL string
  director: RoleData;
  principal: RoleData;
  onBack: () => void;
  onSubmit: () => void;
}

export default function ReviewSchoolForm({
  schoolName,
  address,
  currentSession,
  logo,
  director,
  principal,
  onBack,
  onSubmit,
}: ReviewSchoolFormProps) {
  const renderRoleDetails = (role: RoleData) => {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 space-y-2">
        <p><strong>Name:</strong> {role.name || "—"}</p>
        <p>
          <strong>Email:</strong> {role.email || "—"}{" "}
          {role.email &&
            (role.isVerifiedEmail ? (
              <span className="text-green-600">(Verified)</span>
            ) : (
              <span className="text-red-600">(Not Verified)</span>
            ))}
        </p>
        <p>
          <strong>Phone:</strong> {role.phone || "—"}{" "}
          {role.phone &&
            (role.isVerifiedPhone ? (
              <span className="text-green-600">(Verified)</span>
            ) : (
              <span className="text-red-600">(Not Verified)</span>
            ))}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* School Info */}
      <div>
        <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
          School Information
        </h2>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700 space-y-2">
          <p><strong>Name:</strong> {schoolName}</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Current Session:</strong> {currentSession}</p>
          {logo && (
            <div>
              <strong>Logo:</strong>
              <img
                src={typeof logo === "string" ? logo : URL.createObjectURL(logo)}
                alt="School Logo"
                className="mt-2 w-20 h-20 object-cover rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* Director */}
      <div>
        <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
          Director Details
        </h2>
        {renderRoleDetails(director)}
      </div>

      {/* Principal */}
      <div>
        <h2 className="text-xl font-semibold mb-2 dark:text-gray-100">
          Principal Details
        </h2>
        {renderRoleDetails(principal)}
      </div>

      {/* Buttons */}
      <div className="flex justify-between pt-4">
        <button
          className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onSubmit}
        >
          Create School
        </button>
      </div>
    </div>
  );
}
