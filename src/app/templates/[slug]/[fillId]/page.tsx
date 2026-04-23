import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ArrowLeft, Download, CheckCircle, Pencil } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  section?: string;
}

export default async function FillViewPage({ params }: { params: { slug: string; fillId: string } }) {
  const fillId = parseInt(params.fillId, 10);
  if (isNaN(fillId)) notFound();

  const fill = await prisma.templateFill.findUnique({
    where: { id: fillId },
    include: {
      template: { select: { slug: true, name: true, fields: true, description: true, phase: { select: { name: true } } } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!fill || fill.template.slug !== params.slug) notFound();

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
          <Link href="/templates" className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to Templates
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{fill.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-3)]">
            <Badge variant="accent">{fill.template.name}</Badge>
            <span>{new Date(fill.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/templates/${params.slug}`}
            className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] flex items-center gap-1.5 text-[var(--text-2)]"
          >
            <Pencil size={14} /> Edit
          </Link>
          <a
            href={`/api/templates/fills/${fillId}/export`}
            className="px-3 py-2 text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
          >
            <Download size={14} /> Download .docx
          </a>
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
              return (
                <div key={field.key} className="px-6 py-4">
                  {field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2">
                      {value === 'true' ? (
                        <CheckCircle size={16} className="text-[var(--success)]" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-[var(--border)]" />
                      )}
                      <span className="text-sm text-[var(--text)]">{field.label}</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-[var(--text-3)] uppercase tracking-wider mb-1">
                        {field.label}
                      </div>
                      <div className={`text-sm whitespace-pre-wrap ${isEmpty ? 'text-[var(--text-4)] italic' : 'text-[var(--text)]'}`}>
                        {isEmpty ? '(not provided)' : value}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
}
