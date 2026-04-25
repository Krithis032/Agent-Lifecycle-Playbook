'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DeleteFillButton from '@/components/templates/DeleteFillButton';
import { ArrowLeft, Download, CheckCircle, Pencil, FileText } from 'lucide-react';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  section?: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

interface Fill {
  id: number;
  title: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
  template: {
    slug: string;
    name: string;
    description: string | null;
    fields: unknown;
    phase: { name: string } | null;
  };
  project: { id: number; name: string } | null;
}

export default function FillViewClient({ slug, fillId }: { slug: string; fillId: string }) {
  const [fill, setFill] = useState<Fill | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const id = parseInt(fillId, 10);
    if (isNaN(id)) {
      setNotFoundError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/templates/fills/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Fill) => {
        if (data.template.slug !== slug) {
          setNotFoundError(true);
          setLoading(false);
          return;
        }
        setFill(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch fill:', err);
        setNotFoundError(true);
        setLoading(false);
      });
  }, [slug, fillId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="h-96 bg-[var(--surface-1)] rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  if (notFoundError || !fill) {
    notFound();
  }

  const fields = fill.template.fields as unknown as FieldDef[];
  const values = fill.fieldValues;

  // Group by section
  const sectionMap = new Map<string, FieldDef[]>();
  for (const f of fields) {
    const s = f.section || 'General';
    if (!sectionMap.has(s)) sectionMap.set(s, []);
    sectionMap.get(s)!.push(f);
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/templates/${slug}/fills`} style={{ color: 'var(--brand-primary)' }} className="text-[13px] hover:underline flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to Fill History
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{fill.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            <Badge variant="brand">{fill.template.name}</Badge>
            {fill.project && <Badge variant="info">{fill.project.name}</Badge>}
            <span>{new Date(fill.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/templates/${slug}?edit=${fillId}`}
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            className="px-3 py-2 text-sm font-medium border rounded-lg hover:border-[var(--brand-primary)] flex items-center gap-1.5"
          >
            <Pencil size={14} /> Edit
          </Link>
          <a
            href={`/api/templates/fills/${fillId}/export/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            className="px-3 py-2 text-sm font-medium border rounded-lg hover:border-[var(--brand-primary)] flex items-center gap-1.5"
          >
            <FileText size={14} /> PDF
          </a>
          <a
            href={`/api/templates/fills/${fillId}/export/docx`}
            style={{ backgroundColor: 'var(--brand-primary)' }}
            className="px-3 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
          >
            <Download size={14} /> DOCX
          </a>
          <DeleteFillButton fillId={parseInt(fillId, 10)} templateSlug={slug} />
        </div>
      </div>

      {Array.from(sectionMap.entries()).map(([sectionName, sectionFields]) => (
        <Card key={sectionName} padding="none" className="overflow-hidden">
          <div className="px-6 py-3 border-b" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border-default)' }}>
            <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{sectionName}</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {sectionFields.map(field => {
              const value = values[field.key];
              const isEmpty = !value?.trim();

              // ── TABLE ──
              if (field.type === 'table' && field.columns) {
                let rows: Record<string, string>[] = [];
                try { const p = JSON.parse(value || '[]'); if (Array.isArray(p)) rows = p; } catch { /* */ }
                const cols = field.columns;
                return (
                  <div key={field.key} className="px-6 py-4">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{field.label}</div>
                    {rows.length === 0 ? (
                      <div className="text-sm italic" style={{ color: 'var(--text-quaternary)' }}>(no data)</div>
                    ) : (
                      <div className="overflow-x-auto border rounded-lg" style={{ borderColor: 'var(--border-default)' }}>
                        <table className="w-full text-sm">
                          <thead>
                            <tr style={{ backgroundColor: 'var(--surface-1)' }}>
                              {cols.map(c => (
                                <th key={c.key} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-left border-b" style={{ color: 'var(--text-tertiary)', borderColor: 'var(--border-default)' }}>{c.header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, ri) => (
                              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? 'var(--surface-0)' : 'var(--surface-1)' }}>
                                {cols.map(c => (
                                  <td key={c.key} className="px-3 py-2 text-sm border-b" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>{row[c.key] || ''}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              }

              // ── REPEATABLE ──
              if (field.type === 'repeatable' && field.subFields) {
                let entries: Record<string, string>[] = [];
                try { const p = JSON.parse(value || '[]'); if (Array.isArray(p)) entries = p; } catch { /* */ }
                const subs = field.subFields;
                return (
                  <div key={field.key} className="px-6 py-4">
                    <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{field.label}</div>
                    {entries.length === 0 ? (
                      <div className="text-sm italic" style={{ color: 'var(--text-quaternary)' }}>(no entries)</div>
                    ) : (
                      <div className="space-y-3">
                        {entries.map((entry, ei) => (
                          <div key={ei} className="border rounded-lg p-4" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-1)' }}>
                            <div className="text-xs font-bold mb-2" style={{ color: 'var(--brand-primary)' }}>#{ei + 1}</div>
                            <div className="space-y-1.5">
                              {subs.map(sf => {
                                const sv = entry[sf.key];
                                if (!sv?.trim()) return null;
                                return (
                                  <div key={sf.key} className="flex gap-2 text-sm">
                                    <span className="font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>{sf.label}:</span>
                                    <span className="whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{sv}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // ── CHECKBOX WITH RATIONALE ──
              if (field.type === 'checkbox_with_rationale') {
                let cbData = { checked: false, rationale: '' };
                try { const p = JSON.parse(value || '{}'); if (p && typeof p === 'object') cbData = p; } catch { cbData.checked = value === 'true'; }
                return (
                  <div key={field.key} className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {cbData.checked ? (
                        <CheckCircle size={16} style={{ color: 'var(--status-success)' }} />
                      ) : (
                        <div className="w-4 h-4 rounded border" style={{ borderColor: 'var(--border-default)' }} />
                      )}
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{field.label}</span>
                    </div>
                    {cbData.rationale?.trim() && (
                      <div className="mt-1 ml-6 text-sm italic" style={{ color: 'var(--text-tertiary)' }}>Rationale: {cbData.rationale}</div>
                    )}
                  </div>
                );
              }

              // ── CHECKBOX ──
              if (field.type === 'checkbox') {
                return (
                  <div key={field.key} className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {value === 'true' ? (
                        <CheckCircle size={16} style={{ color: 'var(--status-success)' }} />
                      ) : (
                        <div className="w-4 h-4 rounded border" style={{ borderColor: 'var(--border-default)' }} />
                      )}
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{field.label}</span>
                    </div>
                  </div>
                );
              }

              // ── STANDARD FIELD ──
              return (
                <div key={field.key} className="px-6 py-4">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    {field.label}
                  </div>
                  <div className={`text-sm whitespace-pre-wrap ${isEmpty ? 'italic' : ''}`} style={{ color: isEmpty ? 'var(--text-quaternary)' : 'var(--text-primary)' }}>
                    {isEmpty ? '(not provided)' : value}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
