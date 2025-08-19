// stores/schoolStore.ts
import { create } from "zustand";
import type { ContactInfo } from "../api/types";

type ContactRole = "director" | "principal";
type ContactType = "email" | "phone";



interface SchoolState {
  schoolName: string;
  address: string;
  logo: File | null;
  currentSession:string;
  director: ContactInfo;
  principal: ContactInfo;
  schools:any[];
  setSchools: (schools: any[]) => void;
  clearSchools: () => void;
  updateField: (field: keyof SchoolState, value: any) => void;
  updateRoleField: (role: ContactRole, field: keyof ContactInfo, value: any) => void;
  resetVerification: (role: ContactRole, type: ContactType) => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
  schoolName: "",
  address: "",
  logo: null,
  currentSession:"",
  director: {
    existing: false,
    email: "",
    isVerifiedEmail: false,
    name: "",
    phone: "",
    isVerifiedPhone: false,
    assignMyself: false,
  },
  principal: {
    existing: false,
    email: "",
    isVerifiedEmail: false,
    name: "",
    phone: "",
    isVerifiedPhone: false,
    assignMyself: false,
  },
  schools: [],
// for whole schools
  setSchools: (schools) => set({ schools }),
  clearSchools: () => set({ schools: [] }),
  // ✅ Update top-level school fields
  updateField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  // ✅ Update nested director/principal fields
  updateRoleField: (role, field, value) =>
    set((state) => ({
      ...state,
      [role]: {
        ...state[role],
        [field]: value,
      },
    })),

  // ✅ Reset verification
  resetVerification: (role, type) =>
    set((state) => ({
      ...state,
      [role]: {
        ...state[role],
        [`isVerified${type === "email" ? "Email" : "Phone"}`]: false,
      },
    })),
}));

