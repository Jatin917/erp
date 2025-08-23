"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SectionPage() {
  const [sections, setSections] = useState<string[]>(["A", "B", "C"]);
  const [sectionName, setSectionName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!sectionName.trim()) return;

    if (editingIndex !== null) {
      // Update existing section
      const updated = [...sections];
      updated[editingIndex] = sectionName.trim();
      setSections(updated);
      setEditingIndex(null);
    } else {
      // Add new section
      setSections([...sections, sectionName.trim()]);
    }

    setSectionName("");
  };

  const handleEdit = (index: number) => {
    setSectionName(sections[index]);
    setEditingIndex(index);
  };

  const handleDelete = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Left Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingIndex !== null ? "Edit Section" : "Create Section"}</CardTitle>
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
            {editingIndex !== null ? "Update Section" : "Add Section"}
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
                sections.map((sec, i) => (
                  <TableRow key={i}>
                    <TableCell>{sec}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(i)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(i)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
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
