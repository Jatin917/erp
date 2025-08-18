interface Props {
    student: any;
  }
  
  export default function StudentDetails({ student }: Props) {
    return (
      <div className="bg-[#2a2d32] p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-3">Student Details</h2>
        <p><span className="text-gray-400">Name:</span> {student.name}</p>
        <p><span className="text-gray-400">Class:</span> {student.class}</p>
        <p><span className="text-gray-400">Section:</span> {student.section}</p>
      </div>
    );
  }
  