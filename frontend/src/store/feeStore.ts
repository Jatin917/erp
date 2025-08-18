import { create } from "zustand";
import { persist } from "zustand/middleware";

// -------- Fee Doc Store --------
type FeeDocState = {
  studentId: string;
  session: string;
  admissionFee: string;
  tuitionFee: string;
  transportFee: string;
  hostelFee: string;
  concessions: string;

  setField: <K extends keyof FeeDocState>(key: K, value: FeeDocState[K]) => void;
  resetFields: () => void;
};

export const useFeeDocStore = create<FeeDocState>()(
  persist(
    (set) => ({
      studentId: "",
      session: "",
      admissionFee: "",
      tuitionFee: "",
      transportFee: "",
      hostelFee: "",
      concessions: "",

      setField: (key, value) => set({ [key]: value } as unknown as Pick<FeeDocState, keyof FeeDocState>),
      resetFields: () =>
        set({
          studentId: "",
          session: "",
          admissionFee: "",
          tuitionFee: "",
          transportFee: "",
          hostelFee: "",
          concessions: "",
        }),
    }),
    { name: "fee-doc-store" }
  )
);

// -------- Fee Transaction Store --------
type FeeTransactionState = {
  studentId: string;
  amountPaid: string;
  remarks: string;
  mode: string;
  referenceId: string;
  createdById: string;

  setField: <K extends keyof FeeTransactionState>(key: K, value: FeeTransactionState[K]) => void;
  resetFields: () => void;
};

export const useFeeTransactionStore = create<FeeTransactionState>()(
  persist(
    (set) => ({
      studentId: "",
      amountPaid: "",
      remarks: "",
      mode: "",
      referenceId: "",
      createdById: "",

      setField: (key, value) =>
        set({ [key]: value } as unknown as Pick<FeeTransactionState, keyof FeeTransactionState>),
      resetFields: () =>
        set({
          studentId: "",
          amountPaid: "",
          remarks: "",
          mode: "",
          referenceId: "",
          createdById: "",
        }),
    }),
    { name: "fee-transaction-store" }
  )
);
