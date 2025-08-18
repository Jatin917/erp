import { paymentModeOptions, } from "../../api/types";
import { useSubmitFeeTransaction } from "../../hooks/feeQuery";
import { useFeeTransactionStore } from "../../store/feeStore";
import { Input } from "../common/Input";
import { SelectInput } from "../common/selectorInput";

interface Props {
    student: any;
  }
  
  export default function FeeTransactionForm({ student }: Props) {
    const {amountPaid, remarks, referenceId, setField} = useFeeTransactionStore();
    const {mutate:feeTransactionApi} = useSubmitFeeTransaction();
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      feeTransactionApi(student.studentId);
    };
    return (
      <div className="bg-[#2a2d32] p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-3">Create Fee Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="amountPaid"
            label="Amount"
            value={amountPaid}
            required={true}
            type="number"
            placeholder="Amount"
            onChange={(e)=>setField("amountPaid", e.target.value)}
          />
          <Input
            name="remarks"
            label="Remarks"
            value={remarks}
            required={true}
            type="text"
            placeholder="Remarks"
            onChange={(e)=>setField("remarks", e.target.value)}
          />
          <SelectInput
            name="mode"
            label="Mode"
            required={true}
            options={paymentModeOptions}
            onChange={(e)=>setField("mode", e.target.value)}
          />
          <Input
            name="referenceId"
            label="Reference Id"
            value={referenceId}
            required={false}
            type="text"
            placeholder="Reference Id"
            onChange={(e)=>setField("referenceId", e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-2 rounded bg-[#4dabf7] hover:bg-blue-500 text-black font-semibold"
          >
            Submit Transaction
          </button>
        </form>
      </div>
    );
  }
  