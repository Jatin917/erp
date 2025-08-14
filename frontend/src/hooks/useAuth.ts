import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { loginApi } from "../api/index";
import { useAuthStore } from "../store/authStore";
import type { Permission, Role } from "../api/types";
import toast from "react-hot-toast";

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
    onSuccess: (data) => {
      login({token:data.token, user:data.user});
      toast.success("Logged IN");
    },
  });
};

