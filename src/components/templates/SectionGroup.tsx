'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import FieldRenderer from './FieldRenderer';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
  section?: string;
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
  const filledCount = fields.filter(f => values[f.key]?.trim()).length;

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
