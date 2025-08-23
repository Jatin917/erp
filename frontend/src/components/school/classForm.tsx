import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { SelectInput } from "@/components/common/selectorInput";

interface ClassFormProps {
  sections: string[];
  onSubmit: (data: { className: string; assignedSections: string[] }) => void;
}

export default function ClassForm({ sections, onSubmit }: ClassFormProps) {
  const [className, setClassName] = useState("");
  const [assignedSections, setAssignedSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState("");

  const handleAddSection = () => {
    if (selectedSection && !assignedSections.includes(selectedSection)) {
      setAssignedSections([...assignedSections, selectedSection]);
      setSelectedSection("");
    }
  };

  const handleRemoveSection = (section: string) => {
    setAssignedSections(assignedSections.filter((s) => s !== section));
  };

  const handleSubmit = () => {
    if (!className.trim()) return;
    onSubmit({ className, assignedSections });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Create / Edit Class</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Class Name */}
        <Input
          label="Class Name"
          name="className"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="e.g. Class 5"
          required
        />

        {/* Assign Sections */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <SelectInput
              name="sections"
              label="Available Sections"
              options={sections.map((sec) => ({ label: sec, value: sec }))}
              onChange={(e) => setSelectedSection(e.target.value)}
            />
            <Button onClick={handleAddSection}>Assign</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignedSections.length > 0 ? (
              assignedSections.map((section, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border"
                >
                  {section}
                  <button
                    onClick={() => handleRemoveSection(section)}
                    className="ml-1 text-xs font-bold hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No sections assigned yet.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>
            Save Class
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
