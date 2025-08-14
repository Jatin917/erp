import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUploadStudents } from "../../services/studentApi";
import Button from "../../components/common/Button";

export default function StudentBulkUpload() {
  const qc = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: bulkUploadStudents,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutate(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept=".csv" onChange={handleSelect} />
      <Button disabled={isPending} variant="outline">{isPending ? "Uploading..." : "Upload CSV"}</Button>
    </div>
  );
}
