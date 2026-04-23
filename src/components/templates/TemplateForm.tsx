'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionGroup from './SectionGroup';
import { Save, Loader2 } from 'lucide-react';

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

interface TemplateFormProps {
  templateSlug: string;
  templateName: string;
  fields: FieldDef[];
  initialValues?: Record<string, string>;
  initialTitle?: string;
  fillId?: number;
}

export default function TemplateForm({
  templateSlug,
  templateName,
  fields,
  initialValues = {},
  initialTitle = '',
  fillId,
}: TemplateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Group fields by section
  const sectionOrder: string[] = [];
  const sectionFields: Record<string, FieldDef[]> = {};
  for (const field of fields) {
    const section = field.section || 'General';
    if (!sectionFields[section]) {
      sectionFields[section] = [];
      sectionOrder.push(section);
    }
    sectionFields[section].push(field);
  }

  const requiredFields = fields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => {
    const v = values[f.key];
    if (f.type === 'checkbox') return v === 'true';
    return v?.trim();
  });
  const progress = requiredFields.length > 0
    ? Math.round((filledRequired.length / requiredFields.length) * 100)
    : 100;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (fillId) {
        await fetch(`/api/templates/fills/${fillId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues: values }),
        });
        router.push(`/templates/${templateSlug}/${fillId}`);
      } else {
        const res = await fetch(`/api/templates/${templateSlug}/fill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues: values }),
        });
        const data = await res.json();
        if (res.ok) router.push(`/templates/${templateSlug}/${data.id}`);
        else setError(data.error || 'Save failed');
      }
    } catch (e) {
      console.error(e);
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title + progress */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--text)] mb-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`e.g., ${templateName} — Q4 2024`}
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] bg-[var(--bg)]"
          />
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[var(--text-4)] mb-1">{filledRequired.length}/{requiredFields.length} required</div>
          <div className="w-32 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? 'var(--success)' : 'var(--accent)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      {sectionOrder.map(section => (
        <SectionGroup
          key={section}
          sectionName={section}
          fields={sectionFields[section]}
          values={values}
          onChange={handleChange}
          templateName={templateName}
        />
      ))}

      {/* Save bar */}
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors text-[var(--text-2)]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving...' : fillId ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
