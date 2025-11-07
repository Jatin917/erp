import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { classOptions } from "@/api/types";
import { useCreateClass, useGetAllClasses, useGetAllSections } from "@/hooks/schoolQuery";
import { useSchoolStore } from "@/store/schoolStore";

interface SectionType {
  id: string;
  name: string;
}

interface SectionClassType {
  classId: string;
  name: string;
  sectionId: string;
  section: string;
}

export default function ClassSectionPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { activeSchool } = useSchoolStore();

  const filters = { branchId: activeSchool?.id ?? null };
  const classFilter = { branchId: activeSchool?.id ?? null, name: selectedClass ?? "" };

  const { data: allClasses } = useGetAllClasses(classFilter);
  const { data: allSections } = useGetAllSections(filters);

  const [assignedSections, setAssignedSections] = useState<SectionType[]>([]);
  const { mutate: createClassApi } = useCreateClass();

  // ✅ Sync assignedSections whenever selectedClass or allClasses change
  useEffect(() => {
    if (allClasses && selectedClass) {
      const formatted = (allClasses as SectionClassType[]).map((cls) => ({
        id: cls.sectionId,
        name: cls.section,
      }));
      setAssignedSections(formatted);
    } else {
      setAssignedSections([]);
    }
  }, [allClasses, selectedClass]);

  const toggleSection = (section: SectionType) => {
    setAssignedSections((prev) =>
      prev.find((s) => s.id === section.id)
        ? prev.filter((s) => s.id !== section.id)
        : [...prev, section]
    );
  };

  const handleUpdateSections = () => {
    if (!selectedClass || !activeSchool) return;
    const sectionIds = assignedSections.map((s) => s.id);
    createClassApi({ name: selectedClass, branchId: activeSchool.id, sectionIds });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Left Form */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Sections to Class</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Class</Label>
            <Select onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assign Sections</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Array.isArray(allSections) &&
                allSections.map((section: SectionType) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={section.id}
                      checked={assignedSections.some((s) => s.id === section.id)}
                      onCheckedChange={() => toggleSection(section)}
                    />
                    <label htmlFor={section.id}>{section.name}</label>
                  </div>
                ))}
            </div>
          </div>

          <Button
            onClick={handleUpdateSections}
            disabled={!selectedClass}
            className={`w-full transition-colors ${
              selectedClass
                ? "bg-primary text-white hover:bg-primary-dark cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </Button>
        </CardContent>
      </Card>

      {/* Right Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Sections</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedClass ? (
            <ul className="space-y-2">
              {assignedSections.length > 0 ? (
                assignedSections.map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between items-center border rounded p-2"
                  >
                    <span>{s.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setAssignedSections((prev) =>
                          prev.filter((sec) => sec.id !== s.id)
                        )
                      }
                    >
                      Remove
                    </Button>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No sections assigned yet.
                </p>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Please select a class first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
