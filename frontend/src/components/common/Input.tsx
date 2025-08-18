export function Input({
    name,
    label,
    type = "text",
    required,
    value,
    placeholder,
    onChange,
  }: {
    name: string;
    label: string;
    type?: string;
    value?:string;
    required?: boolean;
    placeholder?:string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          onChange={onChange}
          placeholder={placeholder}
          value={value}
          className="w-full rounded-lg px-3 py-2"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-primary)",
          }}
        />
      </div>
    );
  }