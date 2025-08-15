// stores/schoolStore.ts
import { create } from "zustand";

type ContactRole = "director" | "principal" | null;
type ContactType = "email" | "phone" | null;

interface ContactInfo {
  existing: boolean;
  email: string;
  isVerifiedEmail: boolean;
  name: string;
  phone: string;
  isVerifiedPhone: boolean;
}

interface SchoolState {
  schoolName: string;
  address: string;
  logo: File | null;
  director: ContactInfo;
  principal: ContactInfo;
  updateField: (field: keyof SchoolState, value: any) => void;
  updateRoleField: (role: ContactRole, field: keyof ContactInfo, value: any) => void;
  resetVerification: (role: ContactRole, type: ContactType) => void;
}

export const useSchoolStore = create<SchoolState>((set) => ({
  schoolName: "",
  address: "",
  logo: null,
  director: {
    existing: false,
    email: "",
    isVerifiedEmail: false,
    name: "",
    phone: "",
    isVerifiedPhone: false,
  },
  principal: {
    existing: false,
    email: "",
    isVerifiedEmail: false,
    name: "",
    phone: "",
    isVerifiedPhone: false,
  },

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
