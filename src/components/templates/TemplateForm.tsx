'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SectionGroup from './SectionGroup';
import { Save, Loader2, CloudOff, CheckCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

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

function getDraftKey(templateSlug: string, fillId?: number) {
  return fillId
    ? `adp-draft-${templateSlug}-${fillId}`
    : `adp-draft-${templateSlug}-new`;
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
  const draftKey = getDraftKey(templateSlug, fillId);

  // Load draft from localStorage if available
  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        return draft;
      }
    } catch {
      // ignore
    }
    return null;
  }, [draftKey]);

  const [title, setTitle] = useState(() => {
    const draft = loadDraft();
    return draft?.title || initialTitle;
  });
  const [values, setValues] = useState<Record<string, string>>(() => {
    const draft = loadDraft();
    return draft?.values || initialValues;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [hasDraft, setHasDraft] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if a draft exists on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setHasDraft(true);
    }
  }, [loadDraft]);

  // Auto-save to localStorage on changes (debounced 1.5s)
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      try {
        const draft = { title, values, savedAt: new Date().toISOString() };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftStatus('saved');
        setHasDraft(true);
        setTimeout(() => setDraftStatus('idle'), 2000);
      } catch {
        // storage full or unavailable
      }
    }, 1500);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, values, draftKey]);

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
    } catch {
      // ignore
    }
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
        clearDraft();
        router.push(`/templates/${templateSlug}/${fillId}`);
      } else {
        const res = await fetch(`/api/templates/${templateSlug}/fill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues: values }),
        });
        const data = await res.json();
        if (res.ok) {
          clearDraft();
          router.push(`/templates/${templateSlug}/${data.id}`);
        } else {
          setError(data.error || 'Save failed');
        }
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
      {/* Draft status banner */}
      {hasDraft && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[13px]">
          <CloudOff size={14} />
          <span className="font-medium">Draft auto-saved locally.</span>
          <span className="text-amber-600">Your progress is preserved even if you leave the page.</span>
          <button
            onClick={() => {
              clearDraft();
              setTitle(initialTitle);
              setValues(initialValues);
            }}
            className="ml-auto text-[12px] font-semibold underline hover:text-amber-900"
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Title + progress */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Tooltip content="A descriptive title for this document instance. This will be shown in the document list.">
            <label className="block text-sm font-medium text-[var(--text)] mb-1 cursor-help">Document Title</label>
          </Tooltip>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`e.g., ${templateName} — Q4 2024`}
            title="Enter a descriptive title for this document"
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)] bg-[var(--bg)] transition-all"
          />
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-2 justify-end mb-1">
            {draftStatus === 'saved' && (
              <span className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
                <CheckCircle size={12} /> Draft saved
              </span>
            )}
            <span className="text-xs text-[var(--text-4)]">{filledRequired.length}/{requiredFields.length} required</span>
          </div>
          <Tooltip content={`${progress}% of required fields completed`}>
            <div className="w-32 h-2 bg-[var(--surface)] rounded-full overflow-hidden cursor-help">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? 'var(--success)' : 'var(--accent)',
                }}
              />
            </div>
          </Tooltip>
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
        <Tooltip content="Discard changes and go back">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors text-[var(--text-2)]"
          >
            Cancel
          </button>
        </Tooltip>
        <Tooltip content={fillId ? 'Update this document in the database' : 'Save this document to the database'}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : fillId ? 'Update' : 'Save'}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
