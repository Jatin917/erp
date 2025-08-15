// pages/SchoolCreationPage.tsx
import { useState } from "react";
import Stepper from "../../components/layout/Stepper";
import OtpModal from "../../components/layout/otpModal";
import SchoolDetailsForm from "../../components/layout/SchoolDetails";
import AssignLeadershipForm from "../../components/layout/AssignLeadershipForm";
import { useVerifyOtp } from "../../hooks/authQuery";
import { useSchoolStore } from "../../store/schoolStore";
import ReviewSchoolForm from "../../components/layout/reviewSchoolFrom";
import { useCreateSchool } from "../../hooks/schoolQuery";

interface Contact {
  type: "email" | "phone" | null;
  value: string;
  role: "director" | "principal" | null;
}

export default function SchoolCreationPage() {
  const [step, setStep] = useState(1);
  const [otpModal, setOtpModal] = useState<{ open: boolean, contact: Contact }>({ 
    open: false, 
    contact: { role: null, type: null, value: "" } 
  });
  
  const { mutate: verifyOTP } = useVerifyOtp();
  const { 
    updateField, 
    updateRoleField, 
    resetVerification, 
    director, 
    principal, 
    schoolName, 
    logo, 
    address,
    currentSession
  } = useSchoolStore();
  const {mutate:createSchoolPayload} = useCreateSchool();
  const handleVerifyClick = (contact: Contact) => {
    setOtpModal({ open: true, contact });
  };

  const handleOtpVerify = (otp: string, contact: Contact) => {
    if (contact.type !== null && contact.role !== null) {
      verifyOTP({ 
        role: contact.role, 
        type: contact.type, 
        emailOrPhone: contact.value, 
        otp 
      });
      updateRoleField(contact.role, contact.type === "email" ? "email" : "phone", contact.value);
      setOtpModal({ open: false, contact: { role: null, type: null, value: "" } });
    }
  };

  const handleCreateSchool = async () => {
    createSchoolPayload({schoolName, address, logo, director, principal, currentSession, task:"CREATE_SCHOOL"})
    console.log("Creating school with:", { schoolName, address, logo, director, principal });
  };

  // Get verification status for the current modal contact
  const getVerificationStatus = () => {
    if (otpModal.contact.role === "director") {
      return director.isVerifiedEmail;
    } else if (otpModal.contact.role === "principal") {
      return principal.isVerifiedEmail;
    }
    return false;
  };

  // Handle reset verification with proper types
  const handleResetVerification = (role: "director" | "principal", type: "email" | "phone" | null) => {
    if (role && type) {
      resetVerification(role, type);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Create School
      </h1>

      <Stepper
        steps={["School Details", "Assign Leadership", "Review"]}
        currentStep={step}
      />

      {step === 1 && <SchoolDetailsForm updateField={updateField} onNext={() => setStep(2)} schoolNameProp={schoolName} logo={logo} addressProp={address} currentSessionProp={currentSession} />}
      
      {step === 2 && (
        <AssignLeadershipForm
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          onVerifyClick={handleVerifyClick}
          director={director}
          principal={principal}
          updateRoleField={updateRoleField}
        />
      )}

      {step === 3 && (
        <ReviewSchoolForm
          schoolName={schoolName}
          address={address}
          logo={logo || undefined}
          currentSession={currentSession}
          director={director}
          principal={principal}
          onBack={() => setStep(2)}
          onSubmit={handleCreateSchool}
        />
      )}

      <OtpModal
        open={otpModal.open}
        contact={otpModal.contact}
        onClose={() => setOtpModal({ open: false, contact: { type: null, value: "", role: null } })}
        onVerify={handleOtpVerify}
        resetVerification={handleResetVerification}
        isVerified={getVerificationStatus()}
      />
    </div>
  );
}
