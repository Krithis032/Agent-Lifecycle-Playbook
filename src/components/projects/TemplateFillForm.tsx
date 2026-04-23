'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FileText, Save, X, CheckCircle2 } from 'lucide-react';
import type { TemplateData, TemplateFill } from '@/types/project';

interface TemplateFillFormProps {
  template: TemplateData;
  projectId: number;
  existingFill?: TemplateFill;
  onClose: () => void;
}

export default function TemplateFillForm({ template, projectId, existingFill, onClose }: TemplateFillFormProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (existingFill) {
      setFieldValues(existingFill.fieldValues || {});
      setTitle(existingFill.title);
    } else {
      setTitle(`${template.name} - New`);
      const initial: Record<string, string> = {};
      for (const field of template.fields) {
        initial[field.key] = '';
      }
      setFieldValues(initial);
    }
  }, [template, existingFill]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/templates/${template.id}/fills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title,
          fieldValues,
          fillId: existingFill?.id,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Handle error silently
    } finally {
      setSaving(false);
    }
  };

  const filledCount = Object.values(fieldValues).filter((v) => v.trim()).length;
  const totalFields = template.fields.length;
  const requiredFields = template.fields.filter((f) => f.required);
  const requiredFilled = requiredFields.filter((f) => (fieldValues[f.key] || '').trim()).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={18} className="text-[var(--purple)]" />
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--text)]">{template.name}</h2>
          </div>
          {template.description && (
            <p className="text-[13px] text-[var(--text-3)]">{template.description}</p>
          )}
          <div className="flex gap-2 mt-2">
            <Badge variant="purple">{filledCount}/{totalFields} fields</Badge>
            {existingFill && <Badge variant="green">Saved</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={14} /> Close
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || requiredFilled < requiredFields.length}
          >
            {saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Title */}
      <Card className="mb-4">
        <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-4)] mb-1.5">Document Title</label>
        <input
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[14px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title for this document"
        />
      </Card>

      {/* Fields */}
      <div className="space-y-4">
        {template.fields.map((field) => (
          <Card key={field.key} padding="sm">
            <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">
              {field.label} {field.required && <span className="text-[var(--coral)]">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[13px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none resize-y"
                rows={4}
                placeholder={field.placeholder || ''}
                value={fieldValues[field.key] || ''}
                onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
              />
            ) : (
              <input
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[13px] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                placeholder={field.placeholder || ''}
                value={fieldValues[field.key] || ''}
                onChange={(e) => setFieldValues({ ...fieldValues, [field.key]: e.target.value })}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
