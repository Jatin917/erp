import {API} from "../api/index";

export interface StudentRow {
  id: string;
  name: string;
  className: string;
  rollNo: number;
  status: "Active" | "Inactive";
}

export const fetchStudents = async (): Promise<StudentRow[]> => {
  const { data } = await API.get("/students");
  return data;
};

export const bulkUploadStudents = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await API.post("/students/bulk-upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { inserted: number, errors: [...] }
};
