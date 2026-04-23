'use client';

import AIAssistButton from './AIAssistButton';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: string[];
}

interface FieldRendererProps {
  field: FieldDef;
  value: string;
  onChange: (value: string) => void;
  templateName: string;
  allValues: Record<string, string>;
}

export default function FieldRenderer({ field, value, onChange, templateName, allValues }: FieldRendererProps) {
  const showAssist = ['textarea'].includes(field.type);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--text)]">
          {field.label}
          {field.required && <span className="text-[var(--error)] ml-0.5">*</span>}
        </label>
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
      {field.helpText && <p className="text-xs text-[var(--text-4)]">{field.helpText}</p>}

      {field.type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)] resize-y"
        />
      ) : field.type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
        >
          <option value="">Select...</option>
          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : field.type === 'checkbox' ? (
        <label className="flex items-center gap-2 cursor-pointer">
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
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
        />
      )}
    </div>
  );
}
