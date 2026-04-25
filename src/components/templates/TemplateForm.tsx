'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import SectionGroup from './SectionGroup';
import { Save, Loader2, CloudOff, CheckCircle } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import type { FieldDef } from '@/types/project';

interface TemplateFormProps {
  templateSlug: string;
  templateName: string;
  fields: FieldDef[];
  initialValues?: Record<string, string>;
  initialTitle?: string;
  fillId?: number;
}

const DRAFT_PREFIX = 'adp-draft-';
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getDraftKey(templateSlug: string, fillId?: number) {
  return fillId
    ? `${DRAFT_PREFIX}${templateSlug}-${fillId}`
    : `${DRAFT_PREFIX}${templateSlug}-new`;
}

/** Remove drafts older than 7 days to prevent localStorage bloat. */
function cleanupStaleDrafts() {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(DRAFT_PREFIX)) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const draft = JSON.parse(raw);
        if (draft.savedAt && now - new Date(draft.savedAt).getTime() > DRAFT_MAX_AGE_MS) {
          keysToRemove.push(key);
        }
      } catch {
        // Corrupted draft — remove it
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // localStorage unavailable
  }
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

  // Check if a draft exists on mount + cleanup stale drafts
  useEffect(() => {
    cleanupStaleDrafts();
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
    if (f.type === 'checkbox_with_rationale') {
      try {
        const parsed = JSON.parse(v);
        return parsed.checked;
      } catch { return v === 'true'; }
    }
    if (f.type === 'table' || f.type === 'repeatable') {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.some((row: Record<string, string>) =>
            Object.values(row).some(val => val?.trim())
          );
        }
      } catch { return !!v?.trim(); }
      return false;
    }
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
        const res = await fetchWithAuth(`/api/templates/fills/${fillId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues: values }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Update failed' }));
          setError(data.error || 'Update failed');
          return;
        }
        clearDraft();
        router.push(`/templates/${templateSlug}/${fillId}`);
      } else {
        const res = await fetchWithAuth(`/api/templates/${templateSlug}/fill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, fieldValues: values }),
        });
        const data = await res.json().catch(() => ({ error: 'Save failed' }));
        if (res.ok) {
          clearDraft();
          router.push(`/templates/${templateSlug}/${data.id}`);
        } else {
          setError(data.error || 'Save failed');
        }
      }
    } catch {
      setError('Network error — check your connection and try again');
    } finally {
      setSaving(false);
    }
  };

  // Hover and focus state management
  const [discardHovered, setDiscardHovered] = useState(false);
  const [cancelHovered, setCancelHovered] = useState(false);
  const [saveHovered, setSaveHovered] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Draft status banner */}
      {hasDraft && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]"
          style={{
            backgroundColor: 'var(--status-warning-soft)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(212,168,83,0.15)',
            color: 'var(--status-warning)',
          }}
        >
          <CloudOff size={14} />
          <span className="font-medium">Draft auto-saved locally.</span>
          <span style={{ color: 'var(--status-warning)' }}>Your progress is preserved even if you leave the page.</span>
          <button
            onClick={() => {
              clearDraft();
              setTitle(initialTitle);
              setValues(initialValues);
            }}
            className="ml-auto text-[12px] font-semibold underline"
            style={{ color: discardHovered ? 'var(--status-warning)' : 'inherit' }}
            onMouseEnter={() => setDiscardHovered(true)}
            onMouseLeave={() => setDiscardHovered(false)}
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Title + progress */}
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Tooltip content="A descriptive title for this document instance. This will be shown in the document list.">
            <label
              className="block text-sm font-medium mb-1 cursor-help"
              style={{ color: 'var(--text-primary)' }}
            >
              Document Title
            </label>
          </Tooltip>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setTitleFocused(true)}
            onBlur={() => setTitleFocused(false)}
            placeholder={`e.g., ${templateName} — Q4 2024`}
            title="Enter a descriptive title for this document"
            className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: titleFocused ? 'var(--border-focus)' : 'var(--border-default)',
              backgroundColor: 'var(--surface-0)',
              boxShadow: titleFocused ? '0 0 0 2px var(--brand-soft)' : 'none',
            }}
          />
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-2 justify-end mb-1">
            {draftStatus === 'saved' && (
              <span
                className="flex items-center gap-1 text-[11px] font-medium"
                style={{ color: 'var(--status-success)' }}
              >
                <CheckCircle size={12} /> Draft saved
              </span>
            )}
            <span
              className="text-xs"
              style={{ color: 'var(--text-quaternary)' }}
            >
              {filledRequired.length}/{requiredFields.length} required
            </span>
          </div>
          <Tooltip content={`${progress}% of required fields completed`}>
            <div
              className="w-32 h-2 rounded-full overflow-hidden cursor-help"
              style={{ backgroundColor: 'var(--surface-1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progress === 100 ? 'var(--status-success)' : 'var(--brand-primary)',
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
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: cancelHovered ? 'var(--brand-primary)' : 'var(--border-default)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={() => setCancelHovered(true)}
            onMouseLeave={() => setCancelHovered(false)}
          >
            Cancel
          </button>
        </Tooltip>
        <Tooltip content={fillId ? 'Update this document in the database' : 'Save this document to the database'}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold rounded-lg disabled:opacity-40 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              opacity: saving ? 0.4 : (saveHovered ? 0.9 : 1),
            }}
            onMouseEnter={() => setSaveHovered(true)}
            onMouseLeave={() => setSaveHovered(false)}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : fillId ? 'Update' : 'Save'}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
