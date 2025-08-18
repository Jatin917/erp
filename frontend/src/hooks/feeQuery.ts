import { useMutation, type UseMutationResult} from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useFeeDocStore, useFeeTransactionStore } from "../store/feeStore";
import { feeDocApi, feeTransactionApi } from "../api";

// -------- Fee Doc Mutation --------
export const useSubmitFeeDoc = (): UseMutationResult<
  any, // replace with your API response type
  Error,
  void,
  unknown
> => {
  const resetFeeDoc = useFeeDocStore((state) => state.resetFields);
  const getFeeDoc = useFeeDocStore.getState;

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      const payload = {
        studentId: getFeeDoc().studentId,
        session: getFeeDoc().session,
        admissionFee: getFeeDoc().admissionFee,
        tuitionFee: getFeeDoc().tuitionFee,
        transportFee: getFeeDoc().transportFee,
        hostelFee: getFeeDoc().hostelFee,
        concessions: getFeeDoc().concessions,
      };
      return feeDocApi(payload);
    },
    onSuccess: () => {
      resetFeeDoc();
      toast.success("Fee document submitted successfully");
    },
    onError: (error) => {
      let message = "Failed to submit fee document";
      if ((error as any)?.response?.data?.message) {
        message = (error as any).response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
    },
  });
};

// -------- Fee Transaction Mutation --------
export const useSubmitFeeTransaction = (): UseMutationResult<
  any, // replace with your API response type
  Error,
  void,
  unknown
> => {
  const resetTransaction = useFeeTransactionStore((state) => state.resetFields);
  const getTransaction = useFeeTransactionStore.getState;

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      const payload = {
        studentId: getTransaction().studentId,
        amountPaid: getTransaction().amountPaid,
        remarks: getTransaction().remarks,
        mode: getTransaction().mode,
        referenceId: getTransaction().referenceId,
        createdById: getTransaction().createdById,
      };
      return feeTransactionApi(payload);
    },
    onSuccess: () => {
      resetTransaction();
      toast.success("Fee transaction submitted successfully");
    },
    onError: (error) => {
      let message = "Failed to submit fee transaction";
      if ((error as any)?.response?.data?.message) {
        message = (error as any).response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      toast.error(message);
    },
  });
};
