'use client';

import { useEffect } from 'react';
import AIAssistButton from './AIAssistButton';
import EditableTable from './EditableTable';
import RepeatableField from './RepeatableField';
import CheckboxWithRationale from './CheckboxWithRationale';
import Tooltip from '@/components/ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { FieldDef } from '@/types/project';

interface FieldRendererProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  templateName: string;
  allValues: Record<string, string>;
}

export default function FieldRenderer({ field, value, onChange, templateName, allValues }: FieldRendererProps) {
  const showAssist = ['textarea'].includes(field.type);

  // Auto-set today's date as default for empty date fields
  useEffect(() => {
    if (field.type === 'date' && !value) {
      const today = new Date().toISOString().split('T')[0];
      onChange(today);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Table field type ----
  if (field.type === 'table' && field.columns) {
    return (
      <EditableTable
        columns={field.columns}
        value={value}
        onChange={onChange}
        label={field.label}
        helpText={field.helpText}
        required={field.required}
        defaultRows={field.defaultRows}
      />
    );
  }

  // ---- Repeatable field type ----
  if (field.type === 'repeatable' && field.subFields) {
    return (
      <RepeatableField
        label={field.label}
        helpText={field.helpText}
        required={field.required}
        subFields={field.subFields}
        value={value}
        onChange={onChange}
      />
    );
  }

  // ---- Checkbox with rationale ----
  if (field.type === 'checkbox_with_rationale') {
    return (
      <CheckboxWithRationale
        label={field.label}
        helpText={field.helpText}
        required={field.required}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-[var(--text)]">
            {field.label}
            {field.required && <span className="text-[var(--error)] ml-0.5">*</span>}
          </label>
          {field.helpText && (
            <Tooltip content={field.helpText} position="top">
              <HelpCircle size={14} className="text-[var(--text-4)] hover:text-[var(--accent)] cursor-help transition-colors" />
            </Tooltip>
          )}
        </div>
        {showAssist && (
          <AIAssistButton
            templateName={templateName}
            fieldLabel={field.label}
            fieldHelpText={field.helpText}
            existingValues={allValues}
            onInsert={(text) => onChange(text)}
          />
        )}
      </div>

      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          title={field.helpText || `Enter ${field.label.toLowerCase()}`}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] resize-y transition-all"
        />
      ) : field.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          title={field.helpText || `Select ${field.label.toLowerCase()}`}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] transition-all"
        >
          <option value="">Select...</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer" title={field.helpText || `Toggle ${field.label.toLowerCase()}`}>
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={e => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 accent-[var(--accent)] rounded"
          />
          <span className="text-sm text-[var(--text-2)]">{field.label}</span>
        </label>
      ) : field.type === 'date' ? (
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          title={field.helpText || `Select ${field.label.toLowerCase()}`}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] transition-all"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          title={field.helpText || `Enter ${field.label.toLowerCase()}`}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] transition-all"
        />
      )}
    </div>
  );
}
