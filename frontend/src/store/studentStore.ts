// store/studentStore.ts
import { create } from "zustand";
import type { StudentForm } from "../api/types";


interface StudentState {
  studentForm: StudentForm;
  studentsArray: StudentForm[];
  totalPages:Number
  setField: (key: keyof StudentForm, value: any) => void;
  resetForm: () => void;

  setStudents: (students: StudentForm[]) => void;
  appendStudents: (students: StudentForm[]) => void;
  setTotalPage:(page:Number) =>void;
  clearStudents: () => void;
}

const emptyForm: StudentForm = {
  branchId: "",
  rollNo: "",
  name: "",
  discount: 0,
  lateFine: 0,
  currentYearTotal: 0,
  currentYearTotalPaid: 0,
  currentYearTotalBalance: 0,
  lastYearTotal: 0,
  lastYearTotalPaid: 0,
  lastYearTotalBalance: 0,
};

export const useStudentStore = create<StudentState>((set) => ({
  studentForm: emptyForm,
  studentsArray: [],
  totalPages:0,

  setField: (key, value) =>
    set((state) => ({
      studentForm: { ...state.studentForm, [key]: value },
    })),

  resetForm: () => set({ studentForm: emptyForm }),

  setStudents: (students) => set({ studentsArray: students }),
  appendStudents: (students) =>
    set((state) => ({
      studentsArray: [...state.studentsArray, ...students],
    })),
  setTotalPage:(totalPages:Number)=>set({totalPages}),
  clearStudents: () => set({ studentsArray: [] }),
}));
