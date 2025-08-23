// hooks/useStudentQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useStudentStore } from "../store/studentStore";
import {
  fetchStudents,
  bulkUploadStudents,
  createStudentApi,
  downloadSampleSheetForBulkUpload,
} from "../api/index"; // implement your API calls
import type { StudentForm } from "../api/types";

// Fetch paginated students
export function useFetchStudents(filters: Record<string, any>={}) {
  const { setStudents, setTotalPage } = useStudentStore();
  return useQuery({
    queryKey: ["students", JSON.stringify(filters)],
    queryFn: async () => {
      let data;
      try{
        data = await fetchStudents(filters);
        if(data.pagination) setTotalPage(data.pagination.totalPages)
          setStudents(data.data);
        // else appendStudents(data.data);
        return data;
      }
      catch(err){
        console.log("err int query", err);
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to fetch students");
      console.log(error.message);
    },
  } as any);
}
export function useSampleSheetBulkUpload() {
  return useQuery({
    queryKey: ["bulkUploadSheet"],
    queryFn: async () => {
      const data = await downloadSampleSheetForBulkUpload();
      return data;
    },
    enabled: false, // 🚀 don't fetch automatically
    onError: (error: Error) => {
      toast.error("Failed to download sheet");
      console.log(error.message);
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
  
  