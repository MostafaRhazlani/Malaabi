import { ElementType } from "react";

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  icon: ElementType;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

export default function DataTable<T>({
  title,
  icon: Icon,
  columns,
  rows,
  getRowKey,
  emptyMessage = "No data yet.",
}: DataTableProps<T>) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-500 text-sm px-5 py-6">{emptyMessage}</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wide"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                {columns.map((col) => (
                  <td key={col.header} className="px-5 py-3 text-slate-300">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
