import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCheckUserExists, useSendOtp } from "../../hooks/authQuery";
import type { ContactInfo } from "../../api/types";
// import { checkUserExists } from "../../api";

interface Contact {
  type: "email" | "phone" | null;
  value: string;
  role: Role;
}
type Role = "director" | "principal" | null

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (otp: string, contact: Contact) => void;
  contact: Contact;
  resetVerification: (role: Role, type: Contact["type"]) => void;
  isVerified: boolean;
  director: ContactInfo;
  principal: ContactInfo;
}

export default function OtpModal({ open, onClose, onVerify, contact, resetVerification, isVerified, principal, director }: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState(contact.value);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: checkExists } = useCheckUserExists();
  let checkUser = true;
  //   const [isVerified, setIsVerified] = useState(false); // ✅ Track verification

  const { mutate: sendOTP } = useSendOtp();
  // Reset verification if email changes
  useEffect(() => {
    if (email && email.trim() !== contact.value) {
      resetVerification(contact.role, contact.type);
    }
  }, [email, contact.value]);

  useEffect(() => {
    setEmail(contact.value);
  }, [contact.value]);

  const handleSendOtp = async () => {
    // if (!isVerified || (Date.now() - (verifiedAt || 0) > 5 * 60 * 1000)) {
    //     toast.error("Email verification expired, please verify again");
    //     return;
    // }
    if (email && !email.trim()) {
      toast("⚠️ Please enter a valid email address");
      return;
    }
    console.log("existing checking ", contact, principal, director)
    if (contact.role == "principal" && principal.existing || contact.role == "director" && director.existing) {
      checkUser = false;
    }
    if (!checkUser) {
      const exists = await checkExists(email);
      if (!exists) {
        onClose();
        return toast.error("This user does not exist. Please create one first.");
      }
    }
    setIsLoading(true);
    sendOTP({ email });
    setIsOtpSent(true);
    setIsLoading(false);
  };

  const handleVerify = () => {
    if (otp && !otp.trim()) {
      toast("Please enter the OTP", { icon: "⚠️" });
      return;
    }
    const updatedContact = { ...contact, value: email };
    onVerify(otp, updatedContact); // ✅ Mark as verified
    setIsOtpSent(false); // Hide OTP input after success
  };

  const handleClose = () => {
    setOtp("");
    setEmail(contact.value);
    setIsOtpSent(false);
    onClose();
  };

  return (
    <dialog open={open} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Verify {contact.type === "email" ? "Email" : "Phone"}
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {contact.type === "email" ? "Email Address" : "Phone Number"}
            </label>
            <input
              type={contact.type === "email" ? "email" : "tel"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border-gray-300"
              placeholder={contact.type === "email" ? "Enter email address" : "Enter phone number"}
              disabled={isVerified} // Disable editing after verified
            />
          </div>

          {/* Show "Verified" badge instead of button */}
          {!isVerified && !isOtpSent && (
            <button
              onClick={handleSendOtp}
              disabled={isLoading || (email ? !email.trim() : false)}
              className="w-full mb-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          )}

          {isVerified && (
            <p className="text-green-600 font-medium mb-4">✅ Verified</p>
          )}

          {/* OTP Input */}
          {isOtpSent && !isVerified && (
            <>
              <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
                We have sent an OTP to <span className="font-medium">{email}</span>
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 border-gray-300 mb-4"
                placeholder="Enter OTP"
              />
            </>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
            >
              Cancel
            </button>
            {isOtpSent && !isVerified && (
              <button
                onClick={handleVerify}
                disabled={otp ? !otp.trim() : false}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white"
              >
                Verify
              </button>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
