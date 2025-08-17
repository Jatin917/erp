import { useParams, useNavigate } from "react-router-dom";
import { useStudentStore } from "../../store/studentStore";

export default function StudentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { studentsArray:students } = useStudentStore();
  const student = students.find((s: any) => s.id === id);

  if (!student) {
    return (
      <div className="p-6">
        <div
          className="rounded-xl p-4 inline-flex items-center gap-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
        >
          Student not found.
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 rounded-lg"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)", border: "1px solid var(--border-secondary)" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const Info = ({ label, value }: { label: string; value?: any }) => (
    <div className="flex flex-col">
      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6" style={{ color: "var(--text-primary)" }}>
      {/* Header Card */}
      <div
        className="rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-6"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold">{student.name}</h1>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info label="Admission No" value={student.admissionNo} />
            <Info label="Class" value={student.class} />
            <Info label="Section" value={student.section} />
            <Info label="Roll No" value={student.rollNo} />
          </div>
        </div>
        {student.photoUrl ? (
          <img
            src={student.photoUrl}
            alt="student"
            className="w-28 h-28 rounded-xl object-cover border"
            style={{ borderColor: "var(--border-secondary)" }}
          />
        ) : null}
      </div>

      {/* Contact / Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-4 md:p-6 space-y-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
        >
          <h2 className="text-lg font-semibold">Student Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <Info label="Email" value={student.studentEmail} />
            <Info label="Mobile" value={student.studentMobile} />
            <Info label="Gender" value={student.gender} />
            <Info label="DOB" value={student.dob ? new Date(student.dob).toLocaleDateString() : "—"} />
          </div>
        </div>

        <div
          className="rounded-2xl p-4 md:p-6 space-y-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
        >
          <h2 className="text-lg font-semibold">Addresses</h2>
          <div className="grid grid-cols-1 gap-3">
            <Info label="Permanent Address" value={student.permanentAddress} />
            <Info label="Temporary Address" value={student.temporaryAddress} />
          </div>
        </div>
      </div>

      {/* Parents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-4 md:p-6 space-y-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
        >
          <h2 className="text-lg font-semibold">Father</h2>
          <div className="grid grid-cols-2 gap-4">
            <Info label="Name" value={student.fatherName} />
            <Info label="Occupation" value={student.fatherOccupation} />
            <Info label="Email" value={student.fatherEmail} />
            <Info label="Mobile" value={student.fatherMobile} />
          </div>
        </div>

        <div
          className="rounded-2xl p-4 md:p-6 space-y-3"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-primary)" }}
        >
          <h2 className="text-lg font-semibold">Mother</h2>
          <div className="grid grid-cols-2 gap-4">
            <Info label="Name" value={student.motherName} />
            <Info label="Occupation" value={student.motherOccupation} />
            <Info label="Email" value={student.motherEmail} />
            <Info label="Mobile" value={student.motherMobile} />
          </div>
        </div>
      </div>
    </div>
  );
}
