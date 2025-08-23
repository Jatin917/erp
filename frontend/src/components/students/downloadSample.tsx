import { useSampleSheetBulkUpload } from "@/hooks/studentQuery";
import Button  from "../common/Button";

export const DownloadSample = () => {
  const { refetch, isFetching, data } = useSampleSheetBulkUpload();
  async function downloadSample(){
    const result = await refetch();
    if (result.data) {
      // e.g. trigger file download
      const blob = new Blob([result.data], { type: "application/vnd.ms-excel" });
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
