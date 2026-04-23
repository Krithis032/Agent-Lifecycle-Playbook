import Link from 'next/link';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { FileText, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const phaseColor = (slug: string | undefined) => {
  const map: Record<string, string> = {
    ideation: '#0052cc', architecture: '#6b3fa0', prototype: '#0e7490',
    pilot: '#b45309', production: '#15803d', operations: '#ba1a1a',
  };
  return map[slug || ''] || '#64748b';
};

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    include: {
      phase: { select: { id: true, name: true, slug: true, phaseNum: true } },
      _count: { select: { fills: true } },
    },
    orderBy: { id: 'asc' },
  });

  const totalFills = templates.reduce((s, t) => s + t._count.fills, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">Template Studio</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Professional templates for agent project documentation.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">{templates.length}</div>
            <div className="text-xs text-[var(--text-3)]">Templates</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">{totalFills}</div>
            <div className="text-xs text-[var(--text-3)]">Documents Created</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--text)]">AI</div>
            <div className="text-xs text-[var(--text-3)]">Assist Available</div>
          </div>
        </Card>
      </div>

      {/* Template Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => {
          const color = phaseColor(t.phase?.slug);
          const fields = t.fields as unknown as { key: string }[];
          return (
            <div
              key={t.id}
              className="group bg-[var(--surface-active)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-sm transition-all"
            >
              <div className="h-1.5" style={{ backgroundColor: color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                      {t.name}
                    </h3>
                    <p className="text-xs text-[var(--text-3)] mt-1 line-clamp-2">{t.description}</p>
                  </div>
                  <FileText size={18} className="text-[var(--text-4)] shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--text-4)] mb-4">
                  {t.phase && (
                    <Badge variant="default" className="!text-[10px]">{t.phase.name}</Badge>
                  )}
                  <span>{fields.length} fields</span>
                  <span>·</span>
                  <span>{t._count.fills} fill{t._count.fills !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/templates/${t.slug}`}
                    className="flex-1 px-3 py-2 text-center text-sm font-semibold bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> New Fill
                  </Link>
                  {t._count.fills > 0 && (
                    <Link
                      href={`/templates/${t.slug}/fills`}
                      className="px-3 py-2 text-sm font-medium border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors flex items-center gap-1 text-[var(--text-2)]"
                    >
                      History <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
