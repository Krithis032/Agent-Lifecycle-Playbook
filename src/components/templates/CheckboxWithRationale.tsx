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
            className="w-4 h-4 accent-[var(--accent)] rounded"
          />
          <span className="text-sm font-medium text-[var(--text)]">
            {label}
            {required && <span className="text-[var(--error)] ml-0.5">*</span>}
          </span>
        </label>
        {helpText && (
          <Tooltip content={helpText} position="top">
            <HelpCircle size={14} className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-help transition-colors" />
          </Tooltip>
        )}
      </div>
      <div className="ml-6">
        <label className="text-[11px] font-medium text-[var(--text-3)] block mb-1">
          Rationale <span className="text-[var(--text-4)] font-normal">(explain your assessment)</span>
        </label>
        <textarea
          value={data.rationale}
          onChange={e => emitChange({ ...data, rationale: e.target.value })}
          placeholder="Explain why you checked or unchecked this criteria..."
          rows={2}
          className="w-full px-3 py-2 text-xs border border-[var(--border)] rounded-lg bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)] resize-y transition-all"
        />
      </div>
    </div>
  );
}
