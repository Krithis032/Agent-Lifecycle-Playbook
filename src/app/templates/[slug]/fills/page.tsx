import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import FillHistoryTable from '@/components/templates/FillHistoryTable';
import { ArrowLeft, Plus } from 'lucide-react';

export const revalidate = 30;

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

  const fills = template.fills.map(f => ({
    id: f.id,
    title: f.title,
    projectName: f.project?.name || null,
    updatedAt: f.updatedAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/templates" className="text-[13px] hover:underline flex items-center gap-1 mb-3" style={{ color: 'var(--brand-primary)' }}>
            <ArrowLeft size={14} /> Back to Templates
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {template.name} — Fill History
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{fills.length} document{fills.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link
          href={`/templates/${params.slug}`}
          className="text-white px-4 py-2 text-sm font-semibold hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: 'var(--brand-primary)', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={14} /> New Fill
        </Link>
      </div>

      <Card padding="none" className="overflow-hidden">
        <FillHistoryTable fills={fills} templateSlug={params.slug} />
      </Card>
    </div>
  );
}
