import { useState } from "react";

export default function BulkUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return;
    // TODO: send file to backend
    console.log("Uploading bulk file:", file);
  };

  return (
    <div className="bg-bg-primary text-text-primary dark:bg-bg-tertiary dark:text-text-primary p-6 rounded-2xl shadow-sm max-w-lg">
      <h1 className="text-xl font-semibold mb-4">Bulk Upload Students</h1>
      <div className="border-2 border-dashed border-border-primary p-6 rounded-xl text-center">
        <input type="file" accept=".csv,.xlsx" onChange={handleFile} />
        {file && <p className="mt-2 text-sm">{file.name}</p>}
      </div>
      <button
        onClick={handleUpload}
        className="mt-4 w-full py-2 rounded-lg bg-primary text-white hover:bg-primary/90"
      >
        Upload
      </button>
    </div>
  );
}
