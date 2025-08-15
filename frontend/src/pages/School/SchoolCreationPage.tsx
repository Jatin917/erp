// pages/SchoolCreationPage.tsx
import { useState } from "react";
import Stepper from "../../components/layout/Stepper";
import OtpModal from "../../components/layout/otpModal";
import SchoolDetailsForm from "../../components/layout/SchoolDetails";
import AssignLeadershipForm from "../../components/layout/AssignLeadershipForm";
import { useVerifyOtp } from "../../hooks/authQuery";
import { useSchoolStore } from "../../store/schoolStore";


interface Contact {
    type: "email" | "phone" | null;
    value: string;
    role:Role;
  }
type Role =  "director" | "principal" | null;
export default function SchoolCreationPage() {
  const [step, setStep] = useState(1);
  const [otpModal, setOtpModal] = useState<{open:boolean, contact:Contact}>({ open: false, contact: {role:null, type:null, value:""} });
  const {mutate: verifyOTP} = useVerifyOtp();
  const {updateField, updateRoleField, resetVerification, director, principal} = useSchoolStore(); 

  const handleVerifyClick = (contact:Contact) => {
    console.log("contact ", contact);
    setOtpModal({ open: true, contact });
  };

  const handleOtpVerify = (otp:string, contact:Contact) => {
    if(contact.type!==null){
        verifyOTP({role:contact.role, type:contact.type, emailOrPhone:contact.value, otp});
        updateRoleField(contact.role, contact.type, contact.value);
        setOtpModal({ open: false, contact: {role:null, type:null, value:""} });
    }
  };
  let isVerified = false;
  if(otpModal.contact && otpModal.contact.role){
    isVerified = otpModal.contact.role==="director"?director.isVerifiedEmail:principal.isVerifiedEmail;
  }
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Create School
      </h1>

      <Stepper
        steps={["School Details", "Assign Leadership", "Review"]}
        currentStep={step}
      />

      {step === 1 && <SchoolDetailsForm updateField={updateField} onNext={() => setStep(2)} />}
      {step === 2 && (
        <AssignLeadershipForm
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          onVerifyClick={handleVerifyClick}
          director={director}
          principal={principal}
        />
      )}

      <OtpModal
        open={otpModal.open}
        contact={otpModal.contact}
        onClose={() => setOtpModal({ open: false, contact: {type:null, value:"", role:null} })}
        onVerify={handleOtpVerify}
        resetVerification={resetVerification}
        isVerified={isVerified}
      />
    </div>
  );
}
