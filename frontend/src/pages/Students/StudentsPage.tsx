import {  useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../../store/studentStore";
import { useFetchStudents, useUploadStudentsFromXlsx } from "../../hooks/studentQuery";
import { useFetchSchools } from "../../hooks/schoolQuery";
import { SelectInput } from "../../components/common/selectorInput";
import type { Option } from "../../api/types";

export default function StudentsPage() {
  const navigate = useNavigate();
  const { studentsArray: students, totalPages } = useStudentStore();
  console.log("students array is ", students);
  const [page, setPage] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const queryParams: Record<string, any> = { page };
  if (selectedSchool) {
    queryParams.branchId = selectedSchool;
  }


  // const [filters, setFilters] = useState<Record<string, any>>({page:page});
  //@ts-ignore
  const { isLoading, error } = useFetchStudents({ queryParams });
  //@ts-ignore
  const {data:schools, isLoading:loading} = useFetchSchools();
  // Pagination handlers
  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNext = () => {
    setPage(page + 1);
  };

  return (
    <div
      className="w-full flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
  
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full ">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {schools && <SelectInput 
            name="schools"
            label="Schools"
            required={false}
            options={schools as Option[]}
            onChange={(e)=>setSelectedSchool(e.target.value)}
          />}
          <div
            className="mt-[10px] w-full rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border-primary)",
              minHeight: "500px", // Ensures bg extends with table
            }}
          >
            <div className="overflow-x-auto">
              <table
                className="min-w-full text-sm border-collapse"
                style={{ background: "var(--card-bg)", width: "100%" }}
              >
                <thead
                  className="sticky top-0 z-10"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-tertiary)",
                  }}
                >
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Admission No</th>
                    <th className="text-left px-4 py-3">Class</th>
                    <th className="text-left px-4 py-3">Section</th>
                    <th className="text-left px-4 py-3">Roll No</th>
                    <th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {students?.length ? (
                    students.map((s: any, i: number) => {
                      const barcodeSrc = s.barcodeUrl
                        ? `${import.meta.env.VITE_BACKEND_URL_STATIC}/${s.barcodeUrl.replace(
                            /\\/g,
                            "/"
                          )}`
                        : null;
                      return (
                        <tr
                          key={s.id}
                          className={`cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${
                            i % 2 === 0
                              ? "bg-[var(--card-bg)]"
                              : "bg-[var(--bg-secondary)]"
                          }`}
                          style={{ borderTop: "1px solid var(--border-secondary)" }}
                          onClick={() => navigate(`/students/details/${s.id}`)}
                        >
                          <td className="px-4 py-3">{s.name}</td>
                          <td className="px-4 py-3">{s.admissionNo || "—"}</td>
                          <td className="px-4 py-3">{s.class || "—"}</td>
                          <td className="px-4 py-3">{s.section || "—"}</td>
                          <td className="px-4 py-3">{s.rollNo || "—"}</td>
                          <td className="px-4 py-3">{s.phone || "—"}</td>
                          <td className="px-4 py-3">
                            {barcodeSrc ? (
                              <img
                                src={barcodeSrc}
                                alt="Barcode"
                                className="h-24 w-auto object-contain"
                              />
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center"
                        colSpan={7}
                        style={{ color: "var(--text-secondary)" }}
                      >
                        No students yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
  
            {/* Pagination */}
            {students?.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-[var(--border-secondary)]">
                <button
                  disabled={page === 1}
                  onClick={handlePrev}
                  className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-secondary)",
                  }}
                >
                  Prev
                </button>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Page {String(page)} of {String(totalPages)}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={handleNext}
                  className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border-secondary)",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
  );
  
}
