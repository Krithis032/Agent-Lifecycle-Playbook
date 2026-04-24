'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import FieldRenderer from './FieldRenderer';

interface SubFieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

interface TableColumnDef {
  key: string;
  header: string;
  type: 'text' | 'select' | 'number';
  width?: string;
  options?: string[];
  helpText?: string;
}

interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  section?: string;
  subFields?: SubFieldDef[];
  columns?: TableColumnDef[];
  defaultRows?: number;
}

interface SectionGroupProps {
  sectionName: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  templateName: string;
  defaultOpen?: boolean;
}

export default function SectionGroup({
  sectionName,
  fields,
  values,
  onChange,
  templateName,
  defaultOpen = true,
}: SectionGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const filledCount = fields.filter(f => {
    const v = values[f.key];
    if (!v) return false;
    // For complex types, check if there's meaningful data
    if (f.type === 'table' || f.type === 'repeatable') {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.some((row: Record<string, string>) =>
            Object.values(row).some(val => val?.trim())
          );
        }
      } catch {
        return v.trim().length > 0;
      }
      return false;
    }
    if (f.type === 'checkbox_with_rationale') {
      try {
        const parsed = JSON.parse(v);
        return parsed.checked || parsed.rationale?.trim();
      } catch {
        return v === 'true';
      }
    }
    return v.trim().length > 0;
  }).length;

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown size={16} className="text-[var(--text-3)]" /> : <ChevronRight size={16} className="text-[var(--text-3)]" />}
          <span className="text-sm font-semibold text-[var(--text)]">{sectionName}</span>
        </div>
        <span className="text-xs text-[var(--text-4)]">{filledCount}/{fields.length} filled</span>
      </button>
      {open && (
        <div className="px-5 py-4 space-y-4 bg-[var(--surface-active)]">
          {fields.map(field => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={values[field.key] || ''}
              onChange={v => onChange(field.key, v)}
              templateName={templateName}
              allValues={values}
            />
          ))}
        </div>
      )}
    </div>
  );
}
