import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import DeleteFillButton from '@/components/templates/DeleteFillButton';
import { ArrowLeft, Download, CheckCircle, Pencil, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  section?: string;
  columns?: { key: string; header: string }[];
  subFields?: { key: string; label: string }[];
}

export default async function FillViewPage({ params }: { params: Promise<{ slug: string; fillId: string }> }) {
  const { slug, fillId: fillIdStr } = await params;
  const fillId = parseInt(fillIdStr, 10);
  if (isNaN(fillId)) notFound();

  const fill = await prisma.templateFill.findUnique({
    where: { id: fillId },
    include: {
      template: { select: { slug: true, name: true, fields: true, description: true, phase: { select: { name: true } } } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!fill || fill.template.slug !== slug) notFound();

  const fields = fill.template.fields as unknown as FieldDef[];
  const values = fill.fieldValues as Record<string, string>;

  // Group by section
  const sectionMap = new Map<string, FieldDef[]>();
  for (const f of fields) {
    const s = f.section || 'General';
    if (!sectionMap.has(s)) sectionMap.set(s, []);
    sectionMap.get(s)!.push(f);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href={`/templates/${slug}/fills`} className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to Fill History
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{fill.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-3)]">
            <Badge variant="accent">{fill.template.name}</Badge>
            {fill.project && <Badge variant="purple">{fill.project.name}</Badge>}
            <span>{new Date(fill.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/templates/${slug}?edit=${fillId}`}
            className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] flex items-center gap-1.5 text-[var(--text-2)]"
          >
            <Pencil size={14} /> Edit
          </Link>
          <a
            href={`/api/templates/fills/${fillId}/export/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] flex items-center gap-1.5 text-[var(--text-2)]"
          >
            <FileText size={14} /> PDF
          </a>
          <a
            href={`/api/templates/fills/${fillId}/export/docx`}
            className="px-3 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
          >
            <Download size={14} /> DOCX
          </a>
          <DeleteFillButton fillId={fillId} templateSlug={slug} />
        </div>
      </div>

      {Array.from(sectionMap.entries()).map(([sectionName, sectionFields]) => (
        <Card key={sectionName} padding="none" className="overflow-hidden">
          <div className="px-6 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
            <h2 className="text-[15px] font-semibold text-[var(--text)]">{sectionName}</h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
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
                    <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-2">{field.label}</div>
                    {rows.length === 0 ? (
                      <div className="text-sm text-[var(--text-4)] italic">(no data)</div>
                    ) : (
                      <div className="overflow-x-auto border border-[var(--border)] rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[var(--surface)]">
                              {cols.map(c => (
                                <th key={c.key} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-3)] text-left border-b border-[var(--border)]">{c.header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 0 ? 'bg-[var(--bg)]' : 'bg-[var(--surface)]'}>
                                {cols.map(c => (
                                  <td key={c.key} className="px-3 py-2 text-sm text-[var(--text)] border-b border-[var(--border)]">{row[c.key] || ''}</td>
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
                    <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-2">{field.label}</div>
                    {entries.length === 0 ? (
                      <div className="text-sm text-[var(--text-4)] italic">(no entries)</div>
                    ) : (
                      <div className="space-y-3">
                        {entries.map((entry, ei) => (
                          <div key={ei} className="border border-[var(--border)] rounded-lg p-4 bg-[var(--surface)]">
                            <div className="text-xs font-bold text-[var(--accent)] mb-2">#{ei + 1}</div>
                            <div className="space-y-1.5">
                              {subs.map(sf => {
                                const sv = entry[sf.key];
                                if (!sv?.trim()) return null;
                                return (
                                  <div key={sf.key} className="flex gap-2 text-sm">
                                    <span className="font-medium text-[var(--text-2)] shrink-0">{sf.label}:</span>
                                    <span className="text-[var(--text)] whitespace-pre-wrap">{sv}</span>
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
                        <CheckCircle size={16} className="text-[var(--success)]" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-[var(--border)]" />
                      )}
                      <span className="text-sm text-[var(--text)]">{field.label}</span>
                    </div>
                    {cbData.rationale?.trim() && (
                      <div className="mt-1 ml-6 text-sm text-[var(--text-3)] italic">Rationale: {cbData.rationale}</div>
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
                        <CheckCircle size={16} className="text-[var(--success)]" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-[var(--border)]" />
                      )}
                      <span className="text-sm text-[var(--text)]">{field.label}</span>
                    </div>
                  </div>
                );
              }

              // ── STANDARD FIELD ──
              return (
                <div key={field.key} className="px-6 py-4">
                  <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">
                    {field.label}
                  </div>
                  <div className={`text-sm whitespace-pre-wrap ${isEmpty ? 'text-[var(--text-4)] italic' : 'text-[var(--text)]'}`}>
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
