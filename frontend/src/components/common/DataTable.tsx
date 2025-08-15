export default function DataTable<T extends { id: string | number }>({
    columns, data,
  }: {
    columns: { key: keyof T; header: string; render?: (v: any, row: T) => React.ReactNode }[];
    data: T[];
  }) {
    return (
      <div className="overflow-hidden rounded-2xl border border-primary bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left px-4 py-3 font-semibold text-primary">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={String(row.id)} className={i % 2 === 0 ? "bg-card" : "bg-secondary"}>
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-4 py-3 whitespace-nowrap text-primary">
                    {c.render ? c.render((row as any)[c.key], row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  