'use client';

import { useState, useEffect, useCallback } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { Plus, Trash2, HelpCircle, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import type { TableColumnDef } from '@/types/project';

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

/** Determine minimum width for a column based on its type and header length */
function getColumnMinWidth(col: TableColumnDef): string {
  if (col.width) return col.width;
  if (col.type === 'number') return '90px';
  if (col.type === 'select') return '140px';
  // Text columns: wider to accommodate longer entries
  const headerLen = col.header.length;
  if (headerLen > 15) return '200px';
  return '160px';
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

  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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

  // Calculate total minimum width for the table
  const totalMinWidth = columns.reduce((sum, col) => {
    const w = parseInt(getColumnMinWidth(col));
    return sum + (isNaN(w) ? 160 : w);
  }, 40 + 100); // 40 for # col, 100 for actions col

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
            {required && <span className="ml-0.5" style={{ color: 'var(--status-error)' }}>*</span>}
          </label>
          {helpText && (
            <Tooltip content={helpText} position="top">
              <HelpCircle
                size={14}
                className="cursor-help transition-colors"
                style={{ color: hoveredIcon === 'help' ? 'var(--brand-primary)' : 'var(--text-quaternary)' }}
                onMouseEnter={() => setHoveredIcon('help')}
                onMouseLeave={() => setHoveredIcon(null)}
              />
            </Tooltip>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{rows.length} row{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
        <div className="overflow-x-auto">
          <table className="text-sm" style={{ minWidth: `${totalMinWidth}px`, width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-1)' }}>
                <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center" style={{ width: '40px', minWidth: '40px', color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>#</th>
                {columns.map(col => (
                  <th
                    key={col.key}
                    className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-left"
                    style={{ minWidth: getColumnMinWidth(col), width: col.width || undefined, color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.helpText && (
                        <Tooltip content={col.helpText} position="top">
                          <HelpCircle
                            size={11}
                            className="cursor-help"
                            style={{ color: hoveredIcon === `col-${col.key}` ? 'var(--brand-primary)' : 'var(--text-quaternary)' }}
                            onMouseEnter={() => setHoveredIcon(`col-${col.key}`)}
                            onMouseLeave={() => setHoveredIcon(null)}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-center" style={{ width: '100px', minWidth: '100px', color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="transition-colors"
                  style={{
                    borderBottom: rowIndex === rows.length - 1 ? 'none' : '1px solid var(--border-default)',
                    backgroundColor: hoveredRow === rowIndex ? 'var(--surface-1)' : 'transparent'
                  }}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-2 py-2 text-center text-xs font-mono" style={{ color: 'var(--text-quaternary)' }}>{rowIndex + 1}</td>
                  {columns.map(col => (
                    <td key={col.key} className="px-1.5 py-1.5" style={{ minWidth: getColumnMinWidth(col) }}>
                      {col.type === 'select' ? (
                        <select
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2.5 py-2 text-[12px] rounded transition-all focus:outline-none"
                          style={{
                            border: focusedInput === `${rowIndex}-${col.key}` ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)',
                            boxShadow: focusedInput === `${rowIndex}-${col.key}` ? '0 0 0 2px var(--brand-soft)' : 'none'
                          }}
                          onFocus={() => setFocusedInput(`${rowIndex}-${col.key}`)}
                          onBlur={() => setFocusedInput(null)}
                          title={col.helpText || `Select ${col.header}`}
                        >
                          <option value="">Select {col.header}</option>
                          {col.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : col.type === 'number' ? (
                        <input
                          type="number"
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2.5 py-2 text-[12px] rounded transition-all focus:outline-none"
                          style={{
                            border: focusedInput === `${rowIndex}-${col.key}` ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)',
                            boxShadow: focusedInput === `${rowIndex}-${col.key}` ? '0 0 0 2px var(--brand-soft)' : 'none'
                          }}
                          onFocus={() => setFocusedInput(`${rowIndex}-${col.key}`)}
                          onBlur={() => setFocusedInput(null)}
                          title={col.helpText || `Enter ${col.header}`}
                          min="0"
                        />
                      ) : (
                        <input
                          type="text"
                          value={row[col.key] || ''}
                          onChange={e => updateCell(rowIndex, col.key, e.target.value)}
                          className="w-full px-2.5 py-2 text-[12px] rounded transition-all focus:outline-none"
                          style={{
                            border: focusedInput === `${rowIndex}-${col.key}` ? '1px solid var(--border-focus)' : '1px solid var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)',
                            boxShadow: focusedInput === `${rowIndex}-${col.key}` ? '0 0 0 2px var(--brand-soft)' : 'none'
                          }}
                          onFocus={() => setFocusedInput(`${rowIndex}-${col.key}`)}
                          onBlur={() => setFocusedInput(null)}
                          placeholder={col.header}
                          title={row[col.key] || col.helpText || `Enter ${col.header}`}
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
                          className="p-1 rounded transition-colors"
                          style={{
                            backgroundColor: hoveredButton === `up-${rowIndex}` ? 'var(--surface-1)' : 'transparent',
                            opacity: rowIndex === 0 ? 0.3 : 1
                          }}
                          onMouseEnter={() => setHoveredButton(`up-${rowIndex}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                          title="Move up"
                        >
                          <ChevronUp size={13} style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Move row down">
                        <button
                          onClick={() => moveRow(rowIndex, 'down')}
                          disabled={rowIndex === rows.length - 1}
                          className="p-1 rounded transition-colors"
                          style={{
                            backgroundColor: hoveredButton === `down-${rowIndex}` ? 'var(--surface-1)' : 'transparent',
                            opacity: rowIndex === rows.length - 1 ? 0.3 : 1
                          }}
                          onMouseEnter={() => setHoveredButton(`down-${rowIndex}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                          title="Move down"
                        >
                          <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Duplicate row">
                        <button
                          onClick={() => duplicateRow(rowIndex)}
                          className="p-1 rounded transition-colors"
                          style={{
                            backgroundColor: hoveredButton === `duplicate-${rowIndex}` ? 'var(--status-info-soft)' : 'transparent'
                          }}
                          onMouseEnter={() => setHoveredButton(`duplicate-${rowIndex}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                          title="Duplicate"
                        >
                          <Copy size={13} style={{ color: 'var(--status-info)' }} />
                        </button>
                      </Tooltip>
                      <Tooltip content={rows.length <= 1 ? 'Cannot delete the last row' : 'Delete row'}>
                        <button
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows.length <= 1}
                          className="p-1 rounded transition-colors"
                          style={{
                            backgroundColor: hoveredButton === `delete-${rowIndex}` ? 'var(--status-error-soft)' : 'transparent',
                            opacity: rows.length <= 1 ? 0.3 : 1
                          }}
                          onMouseEnter={() => setHoveredButton(`delete-${rowIndex}`)}
                          onMouseLeave={() => setHoveredButton(null)}
                          title="Delete"
                        >
                          <Trash2 size={13} style={{ color: 'var(--status-error)' }} />
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
        <div className="px-3 py-2.5" style={{ backgroundColor: 'var(--surface-1)', borderTop: '1px solid var(--border-default)' }}>
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors"
            style={{
              color: hoveredButton === 'add-row' ? 'var(--brand-primary)' : 'var(--brand-primary)',
              opacity: hoveredButton === 'add-row' ? 0.8 : 1
            }}
            onMouseEnter={() => setHoveredButton('add-row')}
            onMouseLeave={() => setHoveredButton(null)}
            title="Add a new row to the table"
          >
            <Plus size={14} /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
