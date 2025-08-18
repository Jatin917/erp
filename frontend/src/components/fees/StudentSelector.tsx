interface Props {
    filters: any;
    students:any;
    onSelectStudent: (student: any) => void;
  }
  
  export default function StudentSelector({students, onSelectStudent }: Props) {
    return (
      <div className="bg-[#2a2d32] p-4 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold mb-3">Select Student</h2>
        <select
  disabled={students.length === 0}
  className={`w-full p-2 rounded outline-none 
    ${students.length === 0 
      ? 'bg-[#2a2b30] text-gray-400 cursor-not-allowed' 
      : 'bg-[#1e1f23] text-white cursor-pointer'
    }`}
  onChange={(e) => {
    const student = students.find((s:any) => s.id === Number(e.target.value));
    onSelectStudent(student || null);
  }}
>
  <option value="">-- Select --</option>
  {students.map((s:any) => (
    <option key={s.id} value={s.id}>
      {s.name} (Roll No: {s.rollNo})
    </option>
  ))}
</select>

      </div>
    );
  }
  