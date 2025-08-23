import { useState } from "react";
import { useUploadStudentsFromXlsx } from "@/hooks/studentQuery";
import { useNavigate } from "react-router-dom";
import { CardTitle } from "../ui/card";
import Button from "../common/Button";
import { SelectInput } from "../common/selectorInput";

interface UploadFormProps {
  classes: { id: string; name: string }[];
}

export const UploadForm = ({ classes }: UploadFormProps) => {
  const navigate = useNavigate();
  const branchId = JSON.parse(localStorage.getItem("auth-store") as string).state.user.branchId;
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { mutate: bulkUploadStudents } = useUploadStudentsFromXlsx();

  const handleBulkUpload = async () => {
    if (!file) return;
    setIsSending(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId || "");
    bulkUploadStudents(formData);
    setIsSending(false);
  };

  const handleClassChange = () => {};

  return (
    <>
      {branchId && (
        <div
          className="w-full sticky top-0 z-20"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left Title */}
            <CardTitle className="text-lg font-semibold">Students</CardTitle>

            {/* Right Actions */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Bulk Upload Section */}
              <div
                className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-lg"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border-secondary)",
                }}
              >
                <SelectInput
                  name="class"
                  label="Class"
                  required={true}
                  options={classes.map((cls) => ({ label: cls.name, value: cls.name }))}
                  onChange={handleClassChange}
                />
                <SelectInput
                  name="section"
                  label="Section"
                  required={true}
                  options={classes.map((cls) => ({ label: cls.name, value: cls.name }))}
                  onChange={handleClassChange}
                />
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block text-sm border rounded-md px-2 py-1"
                  style={{
                    color: "var(--text-primary)",
                    borderColor: "var(--border-secondary)",
                  }}
                />
                <Button
                  disabled={!file || isSending}
                  onClick={handleBulkUpload}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSending ? "Uploading..." : "Upload"}
                </Button>
              </div>

              {/* Divider for better spacing in mobile */}
              <span className="hidden md:block text-sm text-gray-400">or</span>

              {/* Single Upload Button */}
              <button
                onClick={() => navigate("/students/upload")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
      )}
    </>
  );
};
