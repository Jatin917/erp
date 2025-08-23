import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";;
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const classes = ["Class 1", "Class 2", "Class 3"];
const allSections = ["A", "B", "C", "D", "E"];

export default function ClassSectionPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [assignedSections, setAssignedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (assignedSections.includes(section)) {
      setAssignedSections(assignedSections.filter((s) => s !== section));
    } else {
      setAssignedSections([...assignedSections, section]);
    }
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
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Assign Sections</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {allSections.map((section) => (
                <div key={section} className="flex items-center space-x-2">
                  <Checkbox
                    id={section}
                    checked={assignedSections.includes(section)}
                    onCheckedChange={() => toggleSection(section)}
                  />
                  <label htmlFor={section}>{section}</label>
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full">Save</Button>
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
                    key={s}
                    className="flex justify-between items-center border rounded p-2"
                  >
                    <span>{s}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        setAssignedSections(
                          assignedSections.filter((sec) => sec !== s)
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
