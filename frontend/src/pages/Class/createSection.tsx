"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCreateSection,
  useGetAllSections,
//   useUpdateSection,
//   useDeleteSection,
} from "@/hooks/schoolQuery";
import { useSchoolStore } from "@/store/schoolStore";

export default function SectionPage() {
  const [sectionName, setSectionName] = useState("");
  const [editingSection, setEditingSection] = useState<any | null>(null);

  const { activeSchool } = useSchoolStore();

  // ✅ Hooks
  const { data: sections = [], refetch } = useGetAllSections({
    branchId: activeSchool?.id,
  });
  const { mutate: createSection } = useCreateSection();
//   const { mutate: updateSection } = useUpdateSection();
//   const { mutate: deleteSection } = useDeleteSection();

  // ✅ Handlers
  const handleSubmit = () => {
    if (!sectionName.trim() || !activeSchool?.id) return;

    if (editingSection) {
      // Update
    //   updateSection(
    //     { id: editingSection.id, name: sectionName },
    //     { onSuccess: () => refetch() }
    //   );
      setEditingSection(null);
    } else {
      // Create
      createSection(
        { name: sectionName, branchId: activeSchool.id },
        { onSuccess: () => refetch() }
      );
    }

    setSectionName("");
  };

  const handleEdit = (section: any) => {
    setSectionName(section.name);
    setEditingSection(section);
  };

  const handleDelete = (id: string) => {
    // deleteSection(
    //   { id },
    //   {
    //     onSuccess: () => {
    //       refetch();
    //     },
    //   }
    // );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Left Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingSection ? "Edit Section" : "Create Section"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sectionName">Section Name</Label>
            <Input
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Enter section (e.g., A, B, C)"
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            {editingSection ? "Update Section" : "Add Section"}
          </Button>
        </CardContent>
      </Card>

      {/* Right Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.length > 0 ? (
                sections.map((sec: any) => (
                  <TableRow key={sec.id}>
                    <TableCell>{sec.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(sec)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(sec.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No sections created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
