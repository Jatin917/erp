import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";

interface SectionFormProps {
  onAddSection: (sectionName: string) => void;
  existingSections: string[];
}

export default function SectionForm({ onAddSection, existingSections }: SectionFormProps) {
  const [sectionName, setSectionName] = useState("");

  const handleAdd = () => {
    if (sectionName.trim() && !existingSections.includes(sectionName.trim())) {
      onAddSection(sectionName.trim());
      setSectionName("");
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Create Section</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Section Name"
          name="sectionName"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          placeholder="e.g. A / B / C"
          required
        />
        <Button onClick={handleAdd} className="px-4 py-2">
          Add Section
        </Button>
      </CardContent>
    </Card>
  );
}
