import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-[9px] font-bold tracking-[1.5px] uppercase"
                style={{ color: 'var(--text-quaternary)', background: 'var(--surface-1)', borderBottom: '1px solid var(--border-default)' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{ borderBottom: '1px solid var(--border-default)' }}
              {...(onRowClick ? { onClick: () => onRowClick(row) } : {})}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
