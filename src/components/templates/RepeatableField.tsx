'use client';

import { useState, useEffect, useCallback } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { Plus, Trash2, HelpCircle, Copy, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import type { SubFieldDef } from '@/types/project';

interface RepeatableFieldProps {
  label: string;
  helpText?: string;
  required?: boolean;
  subFields: SubFieldDef[];
  value: string; // JSON array string or legacy plain text
  onChange: (value: string) => void;
}

type EntryData = Record<string, string>;

function parseEntries(value: string, subFields: SubFieldDef[]): EntryData[] {
  if (!value || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Legacy plain text: put in first field
    if (value.trim() && subFields.length > 0) {
      const entry: EntryData = {};
      subFields.forEach((sf, i) => {
        entry[sf.key] = i === 0 ? value.trim() : '';
      });
      return [entry];
    }
  }
  return [];
}

function createEmptyEntry(subFields: SubFieldDef[]): EntryData {
  const entry: EntryData = {};
  subFields.forEach(sf => {
    if (sf.type === 'date') {
      entry[sf.key] = new Date().toISOString().split('T')[0];
    } else {
      entry[sf.key] = '';
    }
  });
  return entry;
}

export default function RepeatableField({
  label,
  helpText,
  required,
  subFields,
  value,
  onChange,
}: RepeatableFieldProps) {
  const [entries, setEntries] = useState<EntryData[]>(() => {
    const parsed = parseEntries(value, subFields);
    return parsed.length > 0 ? parsed : [createEmptyEntry(subFields)];
  });
  const [expandedEntries, setExpandedEntries] = useState<Record<number, boolean>>({ 0: true });
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const emitChange = useCallback((newEntries: EntryData[]) => {
    setEntries(newEntries);
    onChange(JSON.stringify(newEntries));
  }, [onChange]);

  // Sync from external value changes (e.g., draft load)
  useEffect(() => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setEntries(parsed);
      }
    } catch {
      // ignore non-JSON
    }
  }, [value]);

  const addEntry = () => {
    const newEntries = [...entries, createEmptyEntry(subFields)];
    emitChange(newEntries);
    setExpandedEntries(prev => ({ ...prev, [newEntries.length - 1]: true }));
  };

  const duplicateEntry = (index: number) => {
    const newEntries = [...entries];
    newEntries.splice(index + 1, 0, { ...entries[index] });
    emitChange(newEntries);
    setExpandedEntries(prev => ({ ...prev, [index + 1]: true }));
  };

  const removeEntry = (index: number) => {
    if (entries.length <= 1) return;
    const newEntries = entries.filter((_, i) => i !== index);
    emitChange(newEntries);
    // Clean up expanded state
    const newExpanded: Record<number, boolean> = {};
    Object.entries(expandedEntries).forEach(([k, v]) => {
      const ki = parseInt(k);
      if (ki < index) newExpanded[ki] = v;
      else if (ki > index) newExpanded[ki - 1] = v;
    });
    setExpandedEntries(newExpanded);
  };

  const moveEntry = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;
    const newEntries = [...entries];
    [newEntries[index], newEntries[targetIndex]] = [newEntries[targetIndex], newEntries[index]];
    emitChange(newEntries);
  };

  const updateField = (entryIndex: number, fieldKey: string, fieldValue: string) => {
    const newEntries = entries.map((entry, i) =>
      i === entryIndex ? { ...entry, [fieldKey]: fieldValue } : entry
    );
    emitChange(newEntries);
  };

  const toggleExpanded = (index: number) => {
    setExpandedEntries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Get a preview label for collapsed entries
  const getEntryPreview = (entry: EntryData): string => {
    const firstValue = Object.values(entry).find(v => v?.trim());
    return firstValue ? (firstValue.length > 50 ? firstValue.substring(0, 50) + '...' : firstValue) : 'Empty';
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
            {required && <span style={{ color: 'var(--status-error)' }} className="ml-0.5">*</span>}
          </label>
          {helpText && (
            <Tooltip content={helpText} position="top">
              <HelpCircle
                size={14}
                className="cursor-help transition-colors"
                style={{ color: hoveredButton === 'help-icon' ? 'var(--brand-primary)' : 'var(--text-quaternary)' }}
                onMouseEnter={() => setHoveredButton('help-icon')}
                onMouseLeave={() => setHoveredButton(null)}
              />
            </Tooltip>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</span>
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {entries.map((entry, entryIndex) => {
          const isExpanded = expandedEntries[entryIndex] !== false;
          return (
            <div
              key={entryIndex}
              className="border rounded-lg overflow-hidden"
              style={{ borderColor: 'var(--border-default)' }}
            >
              {/* Entry Header */}
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: hoveredButton === `header-${entryIndex}` ? 'var(--surface-1)' : 'var(--surface-elevated)'
                }}
                onClick={() => toggleExpanded(entryIndex)}
                onMouseEnter={() => setHoveredButton(`header-${entryIndex}`)}
                onMouseLeave={() => setHoveredButton(null)}
              >
                <div className="flex items-center gap-2">
                  {isExpanded
                    ? <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                    : <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                  }
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    #{entryIndex + 1}
                  </span>
                  {!isExpanded && (
                    <span className="text-xs italic truncate max-w-[200px]" style={{ color: 'var(--text-quaternary)' }}>
                      {getEntryPreview(entry)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                  <Tooltip content="Move up">
                    <button
                      onClick={() => moveEntry(entryIndex, 'up')}
                      disabled={entryIndex === 0}
                      className="p-1 rounded disabled:opacity-30 transition-colors"
                      style={{
                        backgroundColor: hoveredButton === `up-${entryIndex}` ? 'var(--surface-elevated)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredButton(`up-${entryIndex}`)}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <ChevronUp size={13} style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Move down">
                    <button
                      onClick={() => moveEntry(entryIndex, 'down')}
                      disabled={entryIndex === entries.length - 1}
                      className="p-1 rounded disabled:opacity-30 transition-colors"
                      style={{
                        backgroundColor: hoveredButton === `down-${entryIndex}` ? 'var(--surface-elevated)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredButton(`down-${entryIndex}`)}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Duplicate">
                    <button
                      onClick={() => duplicateEntry(entryIndex)}
                      className="p-1 rounded transition-colors"
                      style={{
                        backgroundColor: hoveredButton === `duplicate-${entryIndex}` ? 'var(--status-info-soft)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredButton(`duplicate-${entryIndex}`)}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <Copy size={13} style={{ color: 'var(--status-info)' }} />
                    </button>
                  </Tooltip>
                  <Tooltip content={entries.length <= 1 ? 'Cannot delete the last entry' : 'Delete'}>
                    <button
                      onClick={() => removeEntry(entryIndex)}
                      disabled={entries.length <= 1}
                      className="p-1 rounded disabled:opacity-30 transition-colors"
                      style={{
                        backgroundColor: hoveredButton === `delete-${entryIndex}` ? 'var(--error-soft)' : 'transparent'
                      }}
                      onMouseEnter={() => setHoveredButton(`delete-${entryIndex}`)}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <Trash2 size={13} style={{ color: 'var(--status-error)' }} />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Entry Fields */}
              {isExpanded && (
                <div className="px-4 py-3 space-y-3" style={{ backgroundColor: 'var(--surface-elevated)' }}>
                  {subFields.map(sf => (
                    <div key={sf.key} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {sf.label}
                          {sf.required && <span style={{ color: 'var(--status-error)' }} className="ml-0.5">*</span>}
                        </label>
                        {sf.helpText && (
                          <Tooltip content={sf.helpText} position="top">
                            <HelpCircle
                              size={12}
                              className="cursor-help"
                              style={{ color: hoveredButton === `help-${entryIndex}-${sf.key}` ? 'var(--brand-primary)' : 'var(--text-quaternary)' }}
                              onMouseEnter={() => setHoveredButton(`help-${entryIndex}-${sf.key}`)}
                              onMouseLeave={() => setHoveredButton(null)}
                            />
                          </Tooltip>
                        )}
                      </div>
                      {sf.type === 'textarea' ? (
                        <textarea
                          value={entry[sf.key] || ''}
                          onChange={e => updateField(entryIndex, sf.key, e.target.value)}
                          placeholder={sf.placeholder || ''}
                          title={sf.helpText || `Enter ${sf.label.toLowerCase()}`}
                          rows={3}
                          className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none resize-y transition-all"
                          style={{
                            borderColor: focusedInput === `textarea-${entryIndex}-${sf.key}` ? 'var(--border-focus)' : 'var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)',
                            boxShadow: focusedInput === `textarea-${entryIndex}-${sf.key}` ? '0 0 0 2px var(--brand-soft)' : 'none'
                          }}
                          onFocus={() => setFocusedInput(`textarea-${entryIndex}-${sf.key}`)}
                          onBlur={() => setFocusedInput(null)}
                        />
                      ) : sf.type === 'select' ? (
                        <select
                          value={entry[sf.key] || ''}
                          onChange={e => updateField(entryIndex, sf.key, e.target.value)}
                          title={sf.helpText || `Select ${sf.label.toLowerCase()}`}
                          className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all"
                          style={{
                            borderColor: focusedInput === `select-${entryIndex}-${sf.key}` ? 'var(--border-focus)' : 'var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)'
                          }}
                          onFocus={() => setFocusedInput(`select-${entryIndex}-${sf.key}`)}
                          onBlur={() => setFocusedInput(null)}
                        >
                          <option value="">Select...</option>
                          {sf.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : sf.type === 'checkbox' ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={entry[sf.key] === 'true'}
                            onChange={e => updateField(entryIndex, sf.key, e.target.checked ? 'true' : 'false')}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: 'var(--brand-primary)' }}
                          />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sf.label}</span>
                        </label>
                      ) : sf.type === 'date' ? (
                        <input
                          type="date"
                          value={entry[sf.key] || ''}
                          onChange={e => updateField(entryIndex, sf.key, e.target.value)}
                          title={sf.helpText || `Select ${sf.label.toLowerCase()}`}
                          className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all"
                          style={{
                            borderColor: focusedInput === `date-${entryIndex}-${sf.key}` ? 'var(--border-focus)' : 'var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)'
                          }}
                          onFocus={() => setFocusedInput(`date-${entryIndex}-${sf.key}`)}
                          onBlur={() => setFocusedInput(null)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={entry[sf.key] || ''}
                          onChange={e => updateField(entryIndex, sf.key, e.target.value)}
                          placeholder={sf.placeholder || ''}
                          title={sf.helpText || `Enter ${sf.label.toLowerCase()}`}
                          className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-all"
                          style={{
                            borderColor: focusedInput === `input-${entryIndex}-${sf.key}` ? 'var(--border-focus)' : 'var(--border-default)',
                            backgroundColor: 'var(--surface-0)',
                            color: 'var(--text-primary)',
                            boxShadow: focusedInput === `input-${entryIndex}-${sf.key}` ? '0 0 0 2px var(--brand-soft)' : 'none'
                          }}
                          onFocus={() => setFocusedInput(`input-${entryIndex}-${sf.key}`)}
                          onBlur={() => setFocusedInput(null)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Entry Button */}
      <button
        onClick={addEntry}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-dashed rounded-lg transition-colors w-full justify-center"
        style={{
          color: 'var(--brand-primary)',
          borderColor: 'var(--brand-primary)',
          backgroundColor: hoveredButton === 'add-button' ? 'var(--status-info-soft)' : 'transparent'
        }}
        onMouseEnter={() => setHoveredButton('add-button')}
        onMouseLeave={() => setHoveredButton(null)}
        title={`Add another ${label.toLowerCase()}`}
      >
        <Plus size={14} /> Add {label.replace(/s$/, '').replace(/ies$/, 'y')}
      </button>
    </div>
  );
}
