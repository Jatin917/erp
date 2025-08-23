import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DownloadSample } from "@/components/students/downloadSample";
import { UploadForm } from "@/components/students/uploadForm";
import { CsvInstructions } from "@/components/students/csvInstruction";

export default function StudentUploadPage() {
  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Upload Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instructions */}
          <CsvInstructions />

          {/* Download Sample Button */}
          <DownloadSample />

          {/* Upload Form */}
          <UploadForm classes={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
