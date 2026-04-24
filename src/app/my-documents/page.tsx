import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import FillHistoryTable from '@/components/templates/FillHistoryTable';
import { FileText, FolderOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MyDocumentsPage() {
  const fills = await prisma.templateFill.findMany({
    take: 200,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      template: { select: { slug: true, name: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const fillRows = fills.map(f => ({
    id: f.id,
    title: f.title,
    projectName: f.project?.name || null,
    updatedAt: f.updatedAt.toISOString(),
    templateName: f.template.name,
    templateSlug: f.template.slug,
  }));

  const templateCount = new Set(fills.map(f => f.template.slug)).size;
  const projectCount = new Set(fills.filter(f => f.project).map(f => f.project!.id)).size;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">My Documents</h1>
        <p className="text-sm text-[var(--text-3)] mt-1">All filled templates and documents across your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-[var(--accent)]" />
            <span className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Documents</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text)]">{fills.length}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={16} className="text-[var(--purple)]" />
            <span className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Templates Used</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text)]">{templateCount}</div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={16} className="text-[var(--green)]" />
            <span className="text-[11px] font-semibold text-[var(--text-3)] uppercase tracking-wider">Projects</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text)]">{projectCount}</div>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <FillHistoryTable fills={fillRows} showTemplateName />
      </Card>
    </div>
  );
}
