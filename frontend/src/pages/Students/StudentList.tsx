import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../../store/studentStore"; // assuming you have this

export default function StudentList() {
  const students = useStudentStore((s) => s.studentsArray); 
  const navigate = useNavigate();

  return (
    <div className="bg-bg-primary text-text-primary dark:bg-bg-tertiary dark:text-text-primary p-4 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-semibold mb-4">Students</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-border-primary rounded-lg">
          <thead className="bg-bg-secondary dark:bg-bg-primary">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-border-primary hover:bg-bg-secondary dark:hover:bg-bg-primary transition"
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.class}</td>
                  <td className="p-3">{s.rollNo}</td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/students/details/${s.id}`)}
                      className="px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
