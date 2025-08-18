// hooks/useStudentQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useStudentStore } from "../store/studentStore";
import {
  fetchStudents,
  bulkUploadStudents,
  createStudentApi,
} from "../api/index"; // implement your API calls
import type { StudentForm } from "../api/types";

// Fetch paginated students
export function useFetchStudents(filters: Record<string, any>={}) {
  const { setStudents, appendStudents, setTotalPage, resetForm } = useStudentStore();
  return useQuery({
    queryKey: ["students", JSON.stringify(filters)],
    queryFn: async () => {
      const data = await fetchStudents(filters);
      console.log("students onSuccess", data, filters.filters.page==="-1", typeof(filters.filters.page));
      if(data.pagination) setTotalPage(data.pagination.totalPages)
      if (filters.page === 1 || filters.filters.page==="-1") setStudents(data.data);
      else appendStudents(data.data);
      return data;
    },
    onError: (error: Error) => {
      toast.error("Failed to fetch students");
      console.log(error.message);
    },
  } as any);
}

// Fetch single student by id
// export function useFetchStudent(id: string) {
//   const { setField } = useStudentStore();

//   return useQuery({
//     queryKey: ["student", id],
//     queryFn: () => fetchStudentApi(id),
//     enabled: !!id,
//     onSuccess: (data) => {
//       Object.entries(data).forEach(([key, value]) => {
//         setField(key as any, value);
//       });
//     },
//     onError: () => {
//       toast.error("Failed to fetch student");
//     },
//   });
// }

// Upload single student
export function useUploadStudent() {
  const queryClient = useQueryClient();
  const { resetForm, clearStudents } = useStudentStore();

  return useMutation({
    mutationFn:(studentData: StudentForm) => createStudentApi(studentData),
    onSuccess: () => {
      toast.success("Student uploaded successfully!");
      resetForm();
      clearStudents();
      queryClient.invalidateQueries({ queryKey: ["students"], exact:false });
    },
    onError: () => {
      toast.error("Failed to upload student");
    },
  });
}

export function useUploadStudentsFromXlsx() {
    const queryClient = useQueryClient();
    const { clearStudents } = useStudentStore();
  
    return useMutation<any, Error, FormData>({
        mutationFn: (formData: FormData) => bulkUploadStudents(formData),
        onSuccess: () => {
          toast.success("Students uploaded successfully from XLSX!");
          clearStudents();
          queryClient.invalidateQueries({ queryKey: ["students"], exact: false });
        },
        onError: () => {
          toast.error("Failed to upload students from XLSX");
        },
      }); 
  }
  
  