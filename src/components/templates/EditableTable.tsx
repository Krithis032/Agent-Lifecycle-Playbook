'use client';

import { useState, useEffect, useCallback } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { Plus, Trash2, HelpCircle, Copy, ChevronUp, ChevronDown } from 'lucide-react';

export interface TableColumnDef {
  key: string;
  header: string;
  type: 'text' | 'select' | 'number';
  width?: string;
  options?: string[];
  helpText?: string;
}

interface EditableTableProps {
  columns: TableColumnDef[];
  value: string; // JSON string of row data array or legacy plain text
  onChange: (value: string) => void;
  label: string;
  helpText?: string;
  required?: boolean;
  defaultRows?: number;
}

type RowData = Record<string, string>;

function parseRows(value: string, columns: TableColumnDef[]): RowData[] {
  if (!value || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy plain text: put it in the first column as a single row
    if (value.trim()) {
      const row: RowData = {};
      columns.forEach((col, i) => {
        row[col.key] = i === 0 ? value.trim() : '';
      });
      return [row];
    }
  }
  return [];
}

function createEmptyRow(columns: TableColumnDef[]): RowData {
  const row: RowData = {};
  columns.forEach(col => { row[col.key] = ''; });
  return row;
}

export default function EditableTable({
  columns,
  value,
  onChange,
  label,
  helpText,
  required,
  defaultRows = 1,
}: EditableTableProps) {
  const [rows, setRows] = useState<RowData[]>(() => {
    const parsed = parseRows(value, columns);
    if (parsed.length > 0) return parsed;
    // Create default empty rows
    return Array.from({ length: defaultRows }, () => createEmptyRow(columns));
  });

  const emitChange = useCallback((newRows: RowData[]) => {
    setRows(newRows);
    onChange(JSON.stringify(newRows));
  }, [onChange]);

  // Sync from external value changes (e.g., draft load)
  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setRows(parsed);
      }
    } catch {
      // ignore non-JSON values
    }
  }, [value]);

  const addRow = () => {
    emitChange([...rows, createEmptyRow(columns)]);
  };

  const duplicateRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index + 1, 0, { ...rows[index] });
    emitChange(newRows);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return; // Keep at least one row
    emitChange(rows.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const newRows = [...rows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newRows.length) return;
    [newRows[index], newRows[targetIndex]] = [newRows[targetIndex], newRows[index]];
    emitChange(newRows);
  };

  const updateCell = (rowIndex: number, colKey: string, cellValue: string) => {
    const newRows = rows.map((row, i) =>
      i === rowIndex ? { ...row, [colKey]: cellValue } : row
    );
    emitChange(newRows);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">
            {label}
            {required && <span className="text-[var(--error)] ml-0.5">*</span>}
          </label>
          {helpText && (
            <Tooltip content={helpText} position="top">
              <HelpCircle size={14} className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-help transition-colors" />
            </Tooltip>
          )}
        </div>
        <span className="text-xs text-[var(--text-4)]">{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface)]">
                <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)] text-center border-b border-[var(--border)] w-8">#</th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)] text-left border-b border-[var(--border)]"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.helpText && (
                        <Tooltip content={col.helpText} position="top">
                          <HelpCircle size={11} className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-help" />
                        </Tooltip>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-4)] text-center border-b border-[var(--border)] w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-2 py-1.5 text-center text-xs text-[var(--text-4)] font-mono">{rowIndex + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className="px-1.5 py-1.5">
                      {col.type === 'select' ? (
                        <select
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-all"
                          title={col.helpText || `Select ${col.header}`}
                        >
                          <option value="">-</option>
                          {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : col.type === 'number' ? (
                        <input
                          type="number"
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-all"
                          title={col.helpText || `Enter ${col.header}`}
                          min="0"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-[var(--border)] rounded bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none transition-all"
                          placeholder={col.header}
                          title={col.helpText || `Enter ${col.header}`}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-1.5 py-1.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <Tooltip content="Move row up">
                        <button
                          onClick={() => moveRow(rowIndex, 'up')}
                          disabled={rowIndex === 0}
                          className="p-1 rounded hover:bg-[var(--surface)] disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          <ChevronUp size={13} className="text-[var(--text-3)]" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move row down">
                        <button
                          onClick={() => moveRow(rowIndex, 'down')}
                          disabled={rowIndex === rows.length - 1}
                          className="p-1 rounded hover:bg-[var(--surface)] disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown size={13} className="text-[var(--text-3)]" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Duplicate row">
                        <button
                          onClick={() => duplicateRow(rowIndex)}
                          className="p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={13} className="text-blue-500" />
                        </button>
                      </Tooltip>
                      <Tooltip content={rows.length <= 1 ? 'Cannot delete the last row' : 'Delete row'}>
                        <button
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows.length <= 1}
                          className="p-1 rounded hover:bg-red-50 disabled:opacity-30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="px-3 py-2 bg-[var(--surface)] border-t border-[var(--border)]">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-blue-700 transition-colors"
            title="Add a new row to the table"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
