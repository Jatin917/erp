import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

interface AssignRoleCardProps {
  role: string;
  onVerifyClick: (contact: any) => void;
  director: any;
  principal: any;
  name: any;
  setName: any;
  assignMyself: boolean;
  onAssignMyself: () => void;
}

// components/AssignRoleCard.tsx
export default function AssignRoleCard({ 
  role, 
  onVerifyClick, 
  director, 
  principal, 
  name, 
  setName, 
  assignMyself, 
  onAssignMyself 
}: AssignRoleCardProps) {
  const [email, setEmail] = useState<string>("");
  const roleKey = role.toLowerCase() as "director" | "principal";
  const roleData = roleKey === "director" ? director : principal;
  const isVerified = roleData.isVerifiedEmail;
  
  // Get current user details from auth store
  const { user } = useAuthStore();

  // Update local state when store data changes
  useEffect(() => {
    if (roleData.email) {
      setEmail(roleData.email);
    }
    if (roleData.name) {
      setName((prev: any) => ({
        ...prev,
        [roleKey]: { value: roleData.name }
      }));
    }
  }, [roleData.email, roleData.name, roleKey, setName]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear verification when email changes
    if (roleKey === "director") {
      // Update director email
    } else {
      // Update principal email
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName((prev: any) => ({
      ...prev,
      [roleKey]: { value: e.target.value }
    }));
  };

  // When assign myself is selected, populate with current user details
  const handleAssignMyselfChange = (checked: boolean) => {
    if (checked && user) {
      // Auto-populate with current user details
      setEmail(user.email);
      setName((prev: any) => ({
        ...prev,
        [roleKey]: { value: user.name }
      }));
    }
    onAssignMyself();
  };

  return (
    <div className="border rounded-xl p-4 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">
        Assign {role}
      </h2>

      {/* Assign Myself Option */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id={`${role}-self`} 
            checked={assignMyself}
            onChange={(e) => handleAssignMyselfChange(e.target.checked)}
            className="rounded"
          />
          <label htmlFor={`${role}-self`} className="text-sm font-medium dark:text-gray-300">
            Assign Myself as {role}
          </label>
        </div>
      </div>

      {/* Show user details when assign myself is selected */}
      {assignMyself && user && (
        <div className="mb-4 p-3 rounded border" style={{ backgroundColor: 'oklch(0.32 0.14 266.75)', borderColor: 'oklch(0.32 0.14 266.75)' }}>
          <p className="text-sm font-medium mb-2 text-white">
            Your Details (Auto-populated):
          </p>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-white">
                Full Name
              </label>
              <input
                type="text"
                value={user.name}
                className="w-full px-3 py-2 rounded-md text-white cursor-not-allowed"
                style={{ backgroundColor: 'oklch(0.32 0.14 266.75)' }}
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                className="w-full px-3 py-2 rounded-md text-white cursor-not-allowed"
                style={{ backgroundColor: 'oklch(0.32 0.14 266.75)' }}
                disabled
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs" style={{ color: 'oklch(0.54 0.11 158.7)' }}>✅ Auto-verified (current user)</span>
            </div>
          </div>
        </div>
      )}

      {/* Only show other options if not assigning myself */}
      {!assignMyself && (
        <>
          {/* Existing User */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">
              Existing User Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 rounded-md text-white cursor-not-allowed"
                style={{ backgroundColor: 'oklch(0.32 0.14 266.75)', border: '1px solid oklch(0.32 0.14 266.75)' }}
                value={email}
                onChange={handleEmailChange}
                disabled={isVerified}
              />
              <button
                disabled={isVerified || !email.trim()}
                className={`px-3 py-2 rounded-md transition-colors ${
                  isVerified
                    ? "cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
                style={isVerified ? { backgroundColor: 'oklch(0.54 0.11 158.7)', color: 'white' } : {}}
                onClick={() => onVerifyClick({ type: "email", value: email, role: roleKey })}
              >
                {isVerified ? "✅ Verified" : "Verify"}
              </button>
            </div>
            {isVerified && (
              <p className="text-sm mt-1" style={{ color: 'oklch(0.54 0.11 158.7)' }}>✅ Email verified for existing user</p>
            )}
          </div>

          {/* Or Create New */}
          <div className="mb-3">
            <p className="text-sm font-medium mb-1 dark:text-gray-200">Or Create New</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-md text-white"
                style={{ backgroundColor: 'oklch(0.32 0.14 266.75)', border: '1px solid oklch(0.32 0.14 266.75)' }}
                value={name[roleKey].value}
                onChange={handleNameChange}
                disabled={isVerified}
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-md text-white"
                  style={{ backgroundColor: 'oklch(0.32 0.14 266.75)', border: '1px solid oklch(0.32 0.14 266.75)' }}
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isVerified}
                />
                <button
                  disabled={isVerified || !email.trim() || !name[roleKey].value.trim()}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isVerified
                      ? "cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  style={isVerified ? { backgroundColor: 'oklch(0.54 0.11 158.7)', color: 'white' } : {}}
                  onClick={() => onVerifyClick({ type: "email", value: email, role: roleKey })}
                >
                  {isVerified ? "✅ Verified" : "Verify"}
                </button>
              </div>
              {isVerified && (
                <p className="text-sm mt-1" style={{ color: 'oklch(0.54 0.11 158.7)' }}>✅ New user email verified</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Status Summary */}
      <div className="mt-4 p-3 rounded-lg border" style={{ backgroundColor: 'oklch(0.32 0.14 266.75)', borderColor: 'oklch(0.32 0.14 266.75)' }}>
        <p className="text-sm font-medium mb-1 text-white">
          Assignment Status:
        </p>
        {assignMyself ? (
          <div className="text-sm" style={{ color: 'oklch(0.54 0.11 158.7)' }}>
            <p>✅ You will be assigned as {role}</p>
            <p className="text-xs mt-1">
              <strong>Name:</strong> {user?.name || "Loading..."}
            </p>
            <p className="text-xs">
              <strong>Email:</strong> {user?.email || "Loading..."}
            </p>
          </div>
        ) : isVerified ? (
          <p className="text-sm" style={{ color: 'oklch(0.54 0.11 158.7)' }}>✅ {role} assignment ready</p>
        ) : (
          <p className="text-sm text-yellow-600">⚠️ Complete one of the options above</p>
        )}
      </div>
    </div>
  );
}
  