import { useState } from "react";
import StudentFilters from "../components/StudentFilters";
import StudentSelector from "../components/StudentSelector";
import StudentDetails from "../components/StudentDetails";
import FeeTransactionForm from "../components/FeeTransactionForm";

export default function FeeTransactionPage() {
  const [filters, setFilters] = useState({
    class: "",
    section: "",
    session: "",
  });

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Fee Transaction</h1>

      {/* Filter Section */}
      <StudentFilters filters={filters} setFilters={setFilters} />

      {/* Student Selector */}
      <StudentSelector filters={filters} onSelect={setSelectedStudent} />

      {/* Student Details */}
      {selectedStudent && <StudentDetails student={selectedStudent} />}

      {/* Fee Transaction Form */}
      {selectedStudent && <FeeTransactionForm student={selectedStudent} />}
    </div>
  );
}
