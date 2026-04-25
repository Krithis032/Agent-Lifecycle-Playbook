'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import FieldRenderer from './FieldRenderer';
import type { FieldDef } from '@/types/project';

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
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 transition-colors text-left"
        style={{ background: 'var(--surface-1)' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-1)'; }}
      >
        <div className="flex items-center gap-3">
          {open
            ? <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
            : <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
          }
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{sectionName}</span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-quaternary)' }}>{filledCount}/{fields.length} filled</span>
      </button>
      {open && (
        <div className="px-5 py-4 space-y-4" style={{ background: 'var(--surface-elevated)' }}>
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
