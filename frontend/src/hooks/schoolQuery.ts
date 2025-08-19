import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { createSchool as createSchoolApi, fetchSchools } from "../api/index"; // <- API call
import { useSchoolStore } from "../store/schoolStore";
// import type { ApiError } from "../api/types"; // { message: string }

// Payload type (adjust fields as per your API)
export type CreateSchoolPayload = {
  schoolName: string;
  address: string;
  logo:File | null;
  director: {
    name?:string;
    email:string
  };
  principal:{
    name?:string;
    email:string;
  };
  currentSession: string;
  task:string;
};

// Hook for creating a new school
export const useCreateSchool = () => {
  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) => createSchoolApi(payload),

    // ✅ Success
    onSuccess: (data:any) => {
      toast.success(data.message || "School created successfully");
    },

    // ❌ Error
    onError: (error: AxiosError<any>) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create school";
      toast.error(message);
    },
  });
};

export const useFetchSchools = () => {
  const { setSchools } = useSchoolStore();

  return useQuery<
    { schools: { label: string; value: string }[] }, // Expected data format
    Error // Error type
  >({
    queryKey: ["schools"],
    queryFn: async () => {
      const response = await fetchSchools(); // Ensure this returns { schools: [...] }
      return response.schools;
    },
    // @ts-ignore
    onSuccess: (data:any) => {
      setSchools(data); // Assuming setSchools expects this format
    },
    onError: (error:any) => {
      const errorMessage = error?.response?.data?.message || error.message || "Failed to fetch schools";
      toast.error(errorMessage);
    },
  });
};
