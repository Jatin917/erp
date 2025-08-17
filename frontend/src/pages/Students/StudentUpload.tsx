import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentStore } from "../../store/studentStore";

export default function StudentsPage() {
  const navigate = useNavigate();
  const { studentsArray:students } = useStudentStore();
  const branchId = null;
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleBulkUpload = async () => {
    if (!file) return;
    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append("file", file);
      // include branchId or anything else your backend expects
      formData.append("branchId", branchId || "");

      const r = await fetch(`/api/students/bulk-upload`, {
        method: "POST",
        body: formData,
      });
      if (!r.ok) throw new Error("Upload failed");
      alert("Bulk upload request sent");
    } catch (e:any) {
      alert(e.message || "Failed to upload");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="w-full h-full"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Top bar */}
      <div
        className="w-full sticky top-0 z-10"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-semibold">Students</h1>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-secondary)" }}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block text-sm"
                style={{ color: "var(--text-secondary)" }}
              />
              <button
                disabled={!file || isSending}
                onClick={handleBulkUpload}
                className="px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--accent-primary)", color: "#fff" }}
              >
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>

            <button
              onClick={() => navigate("/students/upload")}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
                border: "1px solid var(--border-secondary)",
              }}
            >
              Single Upload
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead
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
                </tr>
              </thead>
              <tbody>
                {students?.length ? (
                  students.map((s: any) => (
                    <tr
                      key={s.id}
                      className="cursor-pointer hover:opacity-90"
                      style={{ borderTop: "1px solid var(--border-secondary)" }}
                      onClick={() => navigate(`/students/details/${s.id}`)}
                    >
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">{s.admissionNo || "—"}</td>
                      <td className="px-4 py-3">{s.class || "—"}</td>
                      <td className="px-4 py-3">{s.section || "—"}</td>
                      <td className="px-4 py-3">{s.rollNo || "—"}</td>
                      <td className="px-4 py-3">{s.studentMobile || "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center" colSpan={6} style={{ color: "var(--text-secondary)" }}>
                      No students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
