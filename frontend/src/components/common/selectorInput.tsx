import React from "react";

interface Option {
  value: string;
  label: string;
}

export function SelectInput({
  name,
  label,
  required,
  options,
  onChange,
}: {
  name: string;
  label?: string;
  required?: boolean;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        onChange={onChange}
        className="w-full rounded-lg px-3 py-2"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-primary)",
          color: "var(--text-primary)",
        }}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
