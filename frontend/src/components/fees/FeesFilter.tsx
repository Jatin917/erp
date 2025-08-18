import { useState } from "react";
import { Input } from "../common/Input";
import { SelectInput } from "../common/selectorInput";
import { classOptions } from "../../api/types";
import { academicSessions } from "../../services";
import Button from "../common/Button";

interface Props {
  onFilterChange: (filters: any) => void;
}

export default function FeesFilter({ onFilterChange }: Props) {
  const [form, setForm] = useState({ class: "", section: "", session: "", page:"-1" });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm(prev => ({
        ...prev,
        [e.target.name]: e.target.value,
        page:"-1"  // reset to first page whenever filter changes
      }));
  };
  const applyFilters = () => {

      onFilterChange(form);
  }
  return (
    <div className="bg-[#2a2d32] p-4 rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-3">Filter Students</h2>
      <div className="grid grid-cols-3 gap-4">
        <SelectInput
        label="Class"
          name="class"
          required={true}
          options={classOptions}
          onChange={handleChange}
        />
        <Input
            label="Section"
          type="text"
          name="section"
          placeholder="Section"
          value={form.section}
          onChange={handleChange}
        />
        <SelectInput
          label="Academic Session"
          name="session"
          options={academicSessions}
          required={true}
          onChange={handleChange}
        />
      </div>
      <Button
        variant="solid"
        onClick={applyFilters}
        className="mt-4 px-4 py-2 rounded bg-[#4dabf7] hover:bg-blue-500 text-black font-semibold"
      >
        Apply
      </Button>
    </div>
  );
}
