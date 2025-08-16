// store/studentStore.ts
import { create } from "zustand";

export interface StudentBasic {
  id: string;
  studentName: string;
  rollNo?: string;
  branchId?: string;
  barcodeUrl?: string;
}

interface StudentState {
  students: StudentBasic[];
  setStudents: (students: StudentBasic[]) => void;
  addStudent: (student: StudentBasic) => void;
  removeStudent: (id: string) => void;
  reset: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  setStudents: (students) => set({ students }),
  addStudent: (student) =>
    set((state) => ({ students: [...state.students, student] })),
  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((s) => s.id !== id),
    })),
  reset: () => set({ students: [] }),
}));
