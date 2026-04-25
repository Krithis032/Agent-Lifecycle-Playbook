'use client';

import { useEffect, useState } from 'react';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';

interface CheckboxWithRationaleProps {
  label: string;
  helpText?: string;
  required?: boolean;
  value: string; // JSON string { checked: boolean, rationale: string } or legacy "true"/"false"
  onChange: (value: string) => void;
}

interface CheckboxData {
  checked: boolean;
  rationale: string;
}

function parseCheckboxData(value: string): CheckboxData {
  if (!value || !value.trim()) return { checked: false, rationale: '' };
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'object' && parsed !== null && 'checked' in parsed) {
      return { checked: !!parsed.checked, rationale: parsed.rationale || '' };
    }
  } catch {
    // Legacy: plain "true" or "false"
    if (value === 'true') return { checked: true, rationale: '' };
  }
  return { checked: false, rationale: '' };
}

export default function CheckboxWithRationale({
  label,
  helpText,
  required,
  value,
  onChange,
}: CheckboxWithRationaleProps) {
  const [data, setData] = useState<CheckboxData>(() => parseCheckboxData(value));

  useEffect(() => {
    setData(parseCheckboxData(value));
  }, [value]);

  const emitChange = (newData: CheckboxData) => {
    setData(newData);
    onChange(JSON.stringify(newData));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer" title={helpText || `Toggle ${label.toLowerCase()}`}>
          <input
            type="checkbox"
            checked={data.checked}
            onChange={e => emitChange({ ...data, checked: e.target.checked })}
            className="w-4 h-4 rounded"
            style={{ accentColor: 'var(--brand-primary)' }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {label}
            {required && <span style={{ color: 'var(--status-error)' }} className="ml-0.5">*</span>}
          </span>
        </label>
        {helpText && (
          <Tooltip content={helpText} position="top">
            <HelpCircle size={14} className="cursor-help transition-colors" style={{ color: 'var(--text-quaternary)' }} />
          </Tooltip>
        )}
      </div>
      <div className="ml-6">
        <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--text-tertiary)' }}>
          Rationale <span className="font-normal" style={{ color: 'var(--text-quaternary)' }}>(explain your assessment)</span>
        </label>
        <textarea
          value={data.rationale}
          onChange={e => emitChange({ ...data, rationale: e.target.value })}
          placeholder="Explain why you checked or unchecked this criteria..."
          rows={2}
          className="w-full px-3 py-2 text-xs rounded-lg focus:outline-none resize-y transition-all"
          style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-soft)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>
    </div>
  );
}
