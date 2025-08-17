// hooks/useStudentQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useStudentStore } from "../store/studentStore";
import {
  fetchStudents,
  bulkUploadStudents,
  createStudent,
} from "../api/index"; // implement your API calls

// Fetch paginated students
export function useFetchStudents(filters: Record<string, any>={}) {
  const { setStudents, appendStudents } = useStudentStore();

  return useQuery({
    queryKey: ["students", filters.page],
    queryFn: () => fetchStudents(filters),
    onSuccess: (data) => {
      if (filters.page === 1) setStudents(data);
      else appendStudents(data);
    },
    onError: () => {
      toast.error("Failed to fetch students");
    },
  });
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
  const { studentForm, resetForm, clearStudents } = useStudentStore();

  return useMutation({
    mutationFn: () => createStudent(studentForm),
    onSuccess: () => {
      toast.success("Student uploaded successfully!");
      resetForm();
      clearStudents();
      queryClient.invalidateQueries({ queryKey: ["students"] });
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
          queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: () => {
          toast.error("Failed to upload students from XLSX");
        },
      }); 
  }
  
  