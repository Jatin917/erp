interface Props {
    student: any;
  }
  
  export default function FeeTransactionForm({ student }: Props) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // TODO: Send transaction to backend
      alert("Fee transaction created!");
    };
  
    return (
      <div className="bg-[#2a2d32] p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-3">Create Fee Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            placeholder="Amount"
            className="w-full p-2 rounded bg-[#1e1f23] text-white outline-none"
          />
          <input
            type="text"
            placeholder="Payment Method (Cash/UPI/Bank)"
            className="w-full p-2 rounded bg-[#1e1f23] text-white outline-none"
          />
          <input
            type="date"
            className="w-full p-2 rounded bg-[#1e1f23] text-white outline-none"
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
  