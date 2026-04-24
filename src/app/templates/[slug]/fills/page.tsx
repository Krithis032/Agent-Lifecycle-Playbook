import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Card from '@/components/ui/Card';
import FillHistoryTable from '@/components/templates/FillHistoryTable';
import { ArrowLeft, Plus } from 'lucide-react';

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

  const fills = template.fills.map(f => ({
    id: f.id,
    title: f.title,
    projectName: f.project?.name || null,
    updatedAt: f.updatedAt.toISOString(),
  }));

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
          <p className="text-sm text-[var(--text-3)] mt-1">{fills.length} document{fills.length !== 1 ? 's' : ''} created</p>
        </div>
        <Link
          href={`/templates/${params.slug}`}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2"
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
