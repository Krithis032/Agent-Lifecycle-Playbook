'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import EditableTable from '@/components/templates/EditableTable';
import RepeatableField from '@/components/templates/RepeatableField';
import CheckboxWithRationale from '@/components/templates/CheckboxWithRationale';
import { FileText, Save, X, CheckCircle2, CloudOff, HelpCircle } from 'lucide-react';
import type { TemplateData, TemplateFill } from '@/types/project';

interface TemplateFillFormProps {
  template: TemplateData;
  projectId: number;
  existingFill?: TemplateFill;
  onClose: () => void;
}

function getDraftKey(templateId: number, projectId: number, fillId?: number) {
  return fillId
    ? `adp-proj-draft-${projectId}-${templateId}-${fillId}`
    : `adp-proj-draft-${projectId}-${templateId}-new`;
}

export default function TemplateFillForm({ template, projectId, existingFill, onClose }: TemplateFillFormProps) {
  const draftKey = getDraftKey(template.id, projectId, existingFill?.id);

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return null;
  };

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const draft = loadDraft();
    if (draft?.fieldValues) return draft.fieldValues;
    if (existingFill) return existingFill.fieldValues || {};
    const initial: Record<string, string> = {};
    for (const field of template.fields) {
      if (field.type === 'date') {
        initial[field.key] = new Date().toISOString().split('T')[0];
      } else {
        initial[field.key] = '';
      }
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(() => {
    const draft = loadDraft();
    return draft?.title || existingFill?.title || `${template.name} - New`;
  });
  const [hasDraft, setHasDraft] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setHasDraft(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to localStorage (debounced 1.5s)
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ title, fieldValues, savedAt: new Date().toISOString() }));
        setHasDraft(true);
      } catch { /* ignore */ }
    }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [title, fieldValues, draftKey]);

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); setHasDraft(false); } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (existingFill?.id) {
        // Update existing fill
        await fetchWithAuth(`/api/templates/fills/${existingFill.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues, projectId }),
        });
      } else {
        // Create new fill using template slug
        await fetchWithAuth(`/api/templates/${template.slug}/fill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, title, fieldValues }),
        });
      }
      clearDraft();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Handle error silently
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.entries(fieldValues).filter(([, v]) => {
    if (!v) return false;
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) {
        return parsed.some((row: Record<string, string>) =>
          Object.values(row).some(val => val?.toString().trim())
        );
      }
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.checked || parsed.rationale?.trim();
      }
    } catch {
      return v.trim().length > 0;
    }
    return v.trim().length > 0;
  }).length;
  const totalFields = template.fields.length;
  const requiredFields = template.fields.filter((f) => f.required);
  const requiredFilled = requiredFields.filter((f) => {
    const v = fieldValues[f.key];
    if (!v) return false;
    if (f.type === 'checkbox') return v === 'true';
    if (f.type === 'checkbox_with_rationale') {
      try { const parsed = JSON.parse(v); return parsed.checked; } catch { return v === 'true'; }
    }
    if (f.type === 'table' || f.type === 'repeatable') {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.some((row: Record<string, string>) =>
            Object.values(row).some(val => val?.toString().trim())
          );
        }
      } catch { return !!v?.trim(); }
      return false;
    }
    return v.trim().length > 0;
  }).length;

  const renderField = (field: TemplateData['fields'][number]) => {
    const value = fieldValues[field.key] || '';
    const onChange = (v: string) => setFieldValues({ ...fieldValues, [field.key]: v });

    // Table field
    if (field.type === 'table' && field.columns) {
      return (
        <Card key={field.key} padding="sm">
          <EditableTable
            columns={field.columns}
            value={value}
            onChange={onChange}
            label={field.label}
            helpText={field.helpText}
            required={field.required}
            defaultRows={field.defaultRows}
          />
        </Card>
      );
    }

    // Repeatable field
    if (field.type === 'repeatable' && field.subFields) {
      return (
        <Card key={field.key} padding="sm">
          <RepeatableField
            label={field.label}
            helpText={field.helpText}
            required={field.required}
            subFields={field.subFields}
            value={value}
            onChange={onChange}
          />
        </Card>
      );
    }

    // Checkbox with rationale
    if (field.type === 'checkbox_with_rationale') {
      return (
        <Card key={field.key} padding="sm">
          <CheckboxWithRationale
            label={field.label}
            helpText={field.helpText}
            required={field.required}
            value={value}
            onChange={onChange}
          />
        </Card>
      );
    }

    // Standard fields
    return (
      <Card key={field.key} padding="sm">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-[12px] font-bold" style={{ color: 'var(--text-secondary)' }}>
            {field.label} {field.required && <span style={{ color: 'var(--status-error)' }}>*</span>}
          </label>
          {field.helpText && (
            <Tooltip content={field.helpText} position="top">
              <HelpCircle size={13} className="cursor-help transition-colors" style={{ color: 'var(--text-quaternary)' }} />
            </Tooltip>
          )}
        </div>
        {field.type === 'textarea' ? (
          <textarea
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2 resize-y"
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            rows={4}
            placeholder={field.placeholder || ''}
            title={field.helpText || `Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : field.type === 'select' ? (
          <select
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            title={field.helpText || `Select ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : field.type === 'checkbox' ? (
          <label className="flex items-center gap-2 cursor-pointer" title={field.helpText || `Toggle ${field.label.toLowerCase()}`}>
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--brand-primary)' }}
            />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{field.label}</span>
          </label>
        ) : field.type === 'date' ? (
          <input
            type="date"
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            title={field.helpText || `Select ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[13px] transition-all focus:outline-none focus:ring-2"
            style={{ border: '1px solid var(--border-default)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            placeholder={field.placeholder || ''}
            title={field.helpText || `Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </Card>
    );
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} style={{ color: 'var(--module-templates)' }} />
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{template.name}</h2>
          </div>
          {template.description && (
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{template.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant="info">{filledCount}/{totalFields} fields</Badge>
            {existingFill && <Badge variant="success">Saved</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={14} /> Close
          </Button>
          <Tooltip content={requiredFilled < requiredFields.length ? `Complete all ${requiredFields.length} required fields before saving` : 'Save this document to the database'}>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || requiredFilled < requiredFields.length}
            >
              {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
              {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Draft banner */}
      {hasDraft && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-[13px] mb-4"
          style={{
            background: 'var(--status-warning-soft)',
            border: '1px solid color-mix(in srgb, var(--status-warning) 30%, transparent)',
            color: 'var(--status-warning)',
          }}
        >
          <CloudOff size={14} />
          <span className="font-medium">Draft auto-saved locally.</span>
          <button
            onClick={() => {
              clearDraft();
              const initial: Record<string, string> = {};
              for (const field of template.fields) {
                initial[field.key] = field.type === 'date' ? new Date().toISOString().split('T')[0] : '';
              }
              setFieldValues(existingFill?.fieldValues || initial);
              setTitle(existingFill?.title || `${template.name} - New`);
            }}
            className="ml-auto text-[12px] font-semibold underline hover:opacity-80"
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Title */}
      <Card className="mb-4">
        <Tooltip content="A descriptive title for this document instance">
          <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5 cursor-help" style={{ color: 'var(--text-quaternary)' }}>Document Title</label>
        </Tooltip>
        <input
          className="w-full px-3 py-2 rounded-[var(--radius-sm)] text-[14px] transition-all focus:outline-none focus:ring-2"
          style={{
            border: '1px solid var(--border-default)',
            background: 'var(--surface-0)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 2px color-mix(in srgb, var(--brand-primary) 15%, transparent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title for this document"
          title="Enter a descriptive title for this document"
        />
      </Card>

      {/* Fields */}
      <div className="space-y-4">
        {template.fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}
