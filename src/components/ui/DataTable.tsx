import type { ReactNode } from "react";

type DataTableColumn<T> = {
  key: keyof T | string;
  title: string;
  className?: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  empty: ReactNode;
};

export function DataTable<T>({ columns, rows, empty }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${column.className ?? ""}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {rows.map((row, idx) => (
              <tr key={idx} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-4 py-3 align-middle text-sm text-slate-700 dark:text-slate-300 ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
