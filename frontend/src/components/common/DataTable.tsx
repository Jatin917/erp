export default function DataTable<T extends { id: string | number }>({
    columns, data,
  }: {
    columns: { key: keyof T; header: string; render?: (v: any, row: T) => React.ReactNode }[];
    data: T[];
  }) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={String(row.id)} className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/40 dark:bg-slate-900/40"}>
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-4 py-3 whitespace-nowrap">
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
  