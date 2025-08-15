// components/AssignLeadershipForm.tsx
import { useState } from "react";
import AssignRoleCard from "./AssignRoleCard";
import { useAuthStore } from "../../store/authStore";

interface Contact {
  value: string;
  role: Role;
}

type Role = "director" | "principal";

interface AssignLeadershipFormProps {
  onBack: () => void;
  onNext: () => void;
  onVerifyClick: (contact: Contact) => void;
  director: any;
  principal: any;
  updateRoleField: (role: Role, field: "existing" | "email" | "isVerifiedEmail" | "name" | "phone" | "isVerifiedPhone" | "assignMyself", value: any) => void;
}

export default function AssignLeadershipForm({ 
  onBack, 
  onNext, 
  onVerifyClick, 
  director, 
  principal, 
  updateRoleField 
}: AssignLeadershipFormProps) {
  const [name, setName] = useState({ "principal": { value: "" }, "director": { value: "" } });
  const { user } = useAuthStore();

  // Check if step 2 is complete
  const isStep2Complete = () => {
    // Director validation
    const directorComplete = 
      director.assignMyself || 
      (director.isVerifiedEmail && director.email) || 
      (director.name && director.isVerifiedEmail);

    // Principal validation  
    const principalComplete = 
      principal.assignMyself || 
      (principal.isVerifiedEmail && principal.email) || 
      (principal.name && principal.isVerifiedEmail);

    return directorComplete && principalComplete;
  };

  const handleNext = () => {
    updateRoleField("principal", "name", name.principal.value);
    updateRoleField("director", "name", name.director.value);
    onNext();
  };

  const handleAssignMyself = (role: "director" | "principal") => {
    const newValue = !(role === "director" ? director.assignMyself : principal.assignMyself);
    updateRoleField(role, "assignMyself", newValue);
    
    if (newValue && user) {
      // When assigning myself, populate with current user details
      updateRoleField(role, "email", user.email);
      updateRoleField(role, "name", user.name);
      updateRoleField(role, "isVerifiedEmail", true); // Auto-verify since it's the current user
      updateRoleField(role, "existing", true); // Mark as existing user
      
      // Update local name state
      setName(prev => ({
        ...prev,
        [role]: { value: user.name }
      }));
    } else {
      // Clear fields when unassigning myself
      updateRoleField(role, "email", "");
      updateRoleField(role, "name", "");
      updateRoleField(role, "isVerifiedEmail", false);
      updateRoleField(role, "existing", false);
      
      // Clear local name state
      setName(prev => ({
        ...prev,
        [role]: { value: "" }
      }));
    }
  };

  return (
    <div className="space-y-6">
      {["Director", "Principal"].map((role) => (
        <AssignRoleCard 
          key={role} 
          role={role} 
          onVerifyClick={onVerifyClick} 
          director={director} 
          principal={principal} 
          name={name} 
          setName={setName}
          assignMyself={role === "Director" ? director.assignMyself : principal.assignMyself}
          onAssignMyself={() => handleAssignMyself(role.toLowerCase() as "director" | "principal")}
        />
      ))}
      
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isStep2Complete()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isStep2Complete()
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isStep2Complete() ? "Next" : "Complete leadership assignments to continue"}
        </button>
      </div>
    </div>
  );
}
