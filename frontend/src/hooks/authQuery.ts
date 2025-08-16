import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { checkUserExists, loginApi, registerUser, sendOTP, verifyOTP } from "../api/index";
import { useAuthStore } from "../store/authStore";
import type { Permission, Role } from "../api/types";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { useSchoolStore } from "../store/schoolStore";

// Expected API response type
type LoginResponse = {
  token: string;
  user: {
    name: string;
    email: string;
    roles: Role[];            // note: plural to support teacher+parent
    permissions: Permission[]; 
  };
};

// Expected variables you pass to mutate()
type LoginVariables = {
  email: string;
  password: string;
  setupKey: string | null;
};

export const useLogin = (): UseMutationResult<
  LoginResponse,
  Error,
  LoginVariables,
  unknown
> => {
  const login = useAuthStore((state) => state.login);

  return useMutation<LoginResponse, Error, LoginVariables>({
    mutationFn: loginApi,

    // ✅ Success handler
    onSuccess: (data) => {
      login({ token: data.token, user: data.user });
      toast.success("Logged in successfully");
    },
    // ❌ Error handler
    onError: (error, _variables, _context) => {
      // If your API sends structured error messages, use that
      // Try to extract Axios error message if possible
      let message = "Failed to login";
      if ((error as any)?.response?.data?.message) {
        message = (error as any).response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
        "Failed to send OTP";
      toast.error(message);
    },

  });
};
export const useRegisterUser = () => {
  return useMutation({
    mutationFn: registerUser,

    // ✅ Success
    onSuccess: (data) => {
      toast.success(data.message || "User registered successfully");
    },

    // ❌ Error
    onError: (error: AxiosError<ApiError>) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to register user";
      toast.error(message);
    },
  });
};
export const useCheckUserExists = () => {
  return useMutation({
    mutationFn: checkUserExists,
    onError: () => {
      toast.error("Failed to check user existence");
    },
  });
};
export const useSendOtp = () => {
  return useMutation({
    mutationFn: sendOTP,

    // ✅ Success handler
    onSuccess: (data) => {
      toast.success(data.message);
    },

    // ❌ Error handler
    onError: (error: AxiosError<ApiError>) => {
      // Works with Axios errors
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";
      toast.error(message);
    },
  });
};
type ApiError = { message: string };
interface VerifyOtpVars {
  role: "director" | "principal" | null;
  type: "email" | "phone" | null;
  emailOrPhone: string;
  otp: string;
}

export const useVerifyOtp = () => {
  const setField = useSchoolStore((state) => state.updateRoleField);

  return useMutation({
    mutationFn: ({ emailOrPhone, otp }: VerifyOtpVars) =>
      verifyOTP({ email: emailOrPhone, otp }), // adjust key names to match your API
    onSuccess: (data, variables) => {
      toast.success(data.message || "OTP verified successfully");
      const { role, type } = variables;
      if(role) setField(role, `isVerified${type === "email" ? "Email" : "Phone"}` as any, true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    },
  });
};


