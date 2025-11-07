import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";
import { createClassApi, createSchool as createSchoolApi, createSectionApi, fetchSchools, getAllClassApi, getAllSectionApi } from "@/api/index"; // <- API call
import { useSchoolStore } from "@/store/schoolStore";
import type { SchoolType } from "@/api/types";
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
  const { setSchools, setActiveSchool } = useSchoolStore();

  return useQuery<SchoolType[], Error>({
    queryKey: ["schools"],
    queryFn: async () => {
      const data = await fetchSchools();
      setSchools(data.schools)
      return data.schools;
    },
    staleTime: 0, // always refetch on mount
    refetchOnMount: "always", // important!
    refetchOnWindowFocus: false, // optional
    // @ts-ignore
    onSuccess: (schools:SchoolType[]) => {
      setSchools(schools);
      if (schools.length === 1) {
        setActiveSchool(schools[0]);
      }
    },
  });
};




export const useGetAllClasses = (filters:{branchId:string | null, name:string}) =>
  useQuery({
    queryKey: ["classes", filters],
    queryFn: async () => {
      if(!filters.branchId) return[];
      const data = await getAllClassApi(filters);
      return data.data;
    },
    // @ts-ignore
    onError: (err: any) => {
      toast.error("Failed to fetch classes");
      console.log(err);
    },
  });

// Fetch all sections (optionally filtered by branch)
export const useGetAllSections = (filters:{branchId:string | null}) =>
  useQuery({
    queryKey: ["sections", filters],
    queryFn: async () => {
      const data = await getAllSectionApi(filters)
      return data.data;
    },
    enabled: !!filters,
    // @ts-ignore
    onError: (err: any) => {
      toast.error("Failed to fetch sections");
      console.log(err);
    },
  });

// Create a class
export const useCreateSection = () => {
  return useMutation({
    mutationFn: (payload: { name: string; branchId: string }) =>
      createSectionApi(payload),

    onSuccess: (data: any) => {
      toast.success(data.message || "Section created successfully");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create section";
      toast.error(message);
    },
  });
};
// Create a section
export const useCreateClass = () => {
  return useMutation({
    mutationFn: (payload: { name: string; branchId: string; sectionIds: string[] }) =>
      createClassApi(payload),

    onSuccess: (data: any) => {
      toast.success(data.message || "Class created successfully");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create class";
      toast.error(message);
    },
  });
};