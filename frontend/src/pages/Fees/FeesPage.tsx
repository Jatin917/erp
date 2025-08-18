import { useState } from "react";
import FeesFilter from "../../components/fees/FeesFilter";
import StudentSelector from "../../components/fees/StudentSelector";
import StudentDetails from "../../components/fees/StudentDetail";
import FeeTransactionForm from "../../components/fees/FeeTransactionForm";
import { useFetchStudents } from "../../hooks/studentQuery";
import { useStudentStore } from "../../store/studentStore";

export default function StudentFeesPage() {
  const [filters, setFilters] = useState<any>({});
  const {studentsArray} = useStudentStore();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
    //@ts-ignore
    const { isLoading, error } = useFetchStudents({ filters });
  console.log("selected student is ", selectedStudent);
  return (
    <div className="min-h-screen bg-[#212529] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Student Fees Management</h1>

      {/* Filter Section */}
      <div className="mb-6">
        <FeesFilter onFilterChange={setFilters} />
      </div>

      {/* Student Selector */}
      <div className="mb-6">
        <StudentSelector students={studentsArray} filters={filters} onSelectStudent={setSelectedStudent} />
      </div>

      {/* Student Details + Transaction Form */}
      {selectedStudent && (
        <div className="space-y-6">
          <StudentDetails student={selectedStudent} />
          <FeeTransactionForm student={selectedStudent} />
        </div>
      )}
    </div>
  );
}
