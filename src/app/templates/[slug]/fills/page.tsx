import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import { ArrowLeft, ArrowRight, FileText, Download, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FillHistoryPage({ params }: { params: { slug: string } }) {
  const template = await prisma.template.findUnique({
    where: { slug: params.slug },
    include: {
      fills: {
        include: { project: { select: { name: true } } },
        orderBy: { updatedAt: 'desc' },
      },
    },
  });

  if (!template) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/templates" className="text-[13px] text-[var(--accent)] hover:underline flex items-center gap-1 mb-3">
            <ArrowLeft size={14} /> Back to Templates
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            {template.name} — Fill History
          </h1>
          <p className="text-sm text-[var(--text-3)] mt-1">{template.fills.length} document{template.fills.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link
          href={`/templates/${params.slug}`}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2"
        >
          <Plus size={14} /> New Fill
        </Link>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-hover)] text-[var(--text-3)]">
              <tr>
                <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Title</th>
                <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Project</th>
                <th className="px-6 py-3 font-medium border-b border-[var(--border)]">Last Updated</th>
                <th className="px-6 py-3 font-medium border-b border-[var(--border)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {template.fills.map(fill => (
                <tr key={fill.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[var(--text-4)]" />
                      <span className="font-medium text-[var(--text)]">{fill.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-3)]">{fill.project?.name || '—'}</td>
                  <td className="px-6 py-4 text-[var(--text-3)]">{new Date(fill.updatedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/templates/${params.slug}/${fill.id}`}
                        className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[13px] font-medium"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                      <a
                        href={`/api/templates/fills/${fill.id}/export`}
                        className="text-[var(--text-3)] hover:text-[var(--accent)] transition-colors"
                        title="Download .docx"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {template.fills.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-3)]">
                    <FileText size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                    <p className="font-medium">No fills yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
