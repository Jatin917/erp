import { useSampleSheetBulkUpload } from "@/hooks/studentQuery";
import Button  from "../common/Button";

export const DownloadSample = () => {
  const { refetch, isFetching } = useSampleSheetBulkUpload();
  async function downloadSample(){
    const result = await refetch();
    if (result.data) {
      // e.g. trigger file download

      // Ensure result.data is a BlobPart (ArrayBuffer, string, etc.)
      // If result.data is a string, convert to Uint8Array for binary download
      let blobData: BlobPart;
      if (result.data instanceof ArrayBuffer) {
        blobData = result.data;
      } else if (typeof result.data === "string") {
        blobData = new Uint8Array(result.data.split("").map(c => c.charCodeAt(0)));
      } else {
    // @ts-ignore
        blobData = result.data;
      }
      const blob = new Blob([blobData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SampleSheet.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="flex justify-end">
      <Button disabled={isFetching} onClick={downloadSample}>
      {isFetching ? "Downloading..." : "Download Sample Sheet"}
      </Button>
    </div>
  );
};
