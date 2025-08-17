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
  updateRoleField: (role: "director" | "principal", field: string, value: any) => void;
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
  onAssignMyself,
  updateRoleField
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
        [roleKey]: { ...prev[roleKey], value: roleData.name }
      }));
    }
  }, [roleData.email, roleData.name, roleKey, setName]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName((prev: any) => ({
      ...prev,
      [roleKey]: { ...prev[roleKey], value: e.target.value }
    }));
  };

  // When assign myself is selected, populate with current user details
  const handleAssignMyselfChange = (checked: boolean) => {
    if (checked && user) {
      setEmail(user.email);
      setName((prev: any) => ({
        ...prev,
        [roleKey]: { ...prev[roleKey], value: user.name }
      }));
    }
    onAssignMyself();
  };

  return (
    <div className="border border-primary rounded-xl p-4 bg-card">
      <h2 className="text-lg font-semibold mb-4 text-primary">
        Assign {role}
      </h2>

      {/* Assign Myself Option */}
      <div className="mb-4 p-3 bg-secondary rounded-lg border border-primary">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id={`${role}-self`} 
            checked={assignMyself}
            onChange={(e) => handleAssignMyselfChange(e.target.checked)}
            className="rounded"
          />
          <label htmlFor={`${role}-self`} className="text-sm font-medium text-secondary">
            Assign Myself as {role}
          </label>
        </div>
      </div>

      {/* Show user details when assign myself is selected */}
      {assignMyself && user && (
        <div className="mb-4 p-3 rounded border bg-accent border-accent">
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
                className="w-full px-3 py-2 rounded-md text-white cursor-not-allowed bg-accent"
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
                className="w-full px-3 py-2 rounded-md text-white cursor-not-allowed bg-accent"
                disabled
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-positive">✅ Auto-verified (current user)</span>
            </div>
          </div>
        </div>
      )}

      {/* Only show other options if not assigning myself */}
      {!assignMyself && (
        <>
          {/* Existing User */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-secondary">
              Existing User Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email"
                className="flex-1 px-3 py-2 rounded-md text-primary bg-secondary border border-primary"
                value={email}
                onChange={handleEmailChange}
                disabled={isVerified}
              />
              <button
                disabled={isVerified || !email.trim()}
                className={`px-3 py-2 rounded-md transition-colors ${
                  isVerified
                    ? "cursor-not-allowed"
                    : "bg-accent text-white hover:bg-accent"
                }`}
                style={isVerified ? { backgroundColor: 'var(--positive)', color: 'white' } : {}}
                onClick={() => {
                  onVerifyClick({ type: "email", value: email, role: roleKey });
                  updateRoleField(roleKey, "existing", true); // ✅ mark as existing
                }}
              >
                {isVerified ? "✅ Verified" : "Verify"}
              </button>
            </div>
            {isVerified && (
              <p className="text-sm mt-1 text-positive">✅ Email verified for existing user</p>
            )}
          </div>

          {/* Or Create New */}
          <div className="mb-3">
            <p className="text-sm font-medium mb-1 text-secondary">Or Create New</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-md text-primary bg-secondary border border-primary"
                value={name[roleKey].value}
                onChange={handleNameChange}
                disabled={isVerified}
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 rounded-md text-primary bg-secondary border border-primary"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isVerified}
                />
                <button
                  disabled={isVerified || !email.trim() || !name[roleKey].value.trim()}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isVerified
                      ? "cursor-not-allowed"
                      : "bg-accent text-white hover:bg-accent"
                  }`}
                  style={isVerified ? { backgroundColor: 'var(--positive)', color: 'white' } : {}}
                  onClick={() => {
                    onVerifyClick({ type: "email", value: email, role: roleKey });
                    updateRoleField(roleKey, "existing", false); // ✅ mark as new
                  }}
                >
                  {isVerified ? "✅ Verified" : "Verify"}
                </button>
              </div>
              {isVerified && (
                <p className="text-sm mt-1 text-positive">✅ New user email verified</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Status Summary */}
      <div className="mt-4 p-3 rounded-lg border bg-accent border-accent">
        <p className="text-sm font-medium mb-1 text-white">
          Assignment Status:
        </p>
        {assignMyself ? (
          <div className="text-sm text-positive">
            <p>✅ You will be assigned as {role}</p>
            <p className="text-xs mt-1">
              <strong>Name:</strong> {user?.name || "Loading..."}
            </p>
            <p className="text-xs">
              <strong>Email:</strong> {user?.email || "Loading..."}
            </p>
          </div>
        ) : isVerified ? (
          <p className="text-sm text-positive">✅ {role} assignment ready</p>
        ) : (
          <p className="text-sm text-warning">⚠️ Complete one of the options above</p>
        )}
      </div>
    </div>
  );
}
