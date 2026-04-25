'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import FillHistoryTable from '@/components/templates/FillHistoryTable';
import { ArrowLeft, Plus } from 'lucide-react';

interface Fill {
  id: number;
  title: string;
  projectName: string | null;
  updatedAt: string;
}

interface Template {
  slug: string;
  name: string;
  fills: Fill[];
}

export default function FillHistoryClient({ slug }: { slug: string }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    fetch('/api/templates/fills')
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Fill[]) => {
        // Filter fills for this template
        const filteredFills = data.filter((f: Fill & { templateSlug?: string }) =>
          (f as Fill & { templateSlug: string }).templateSlug === slug
        );

        // Get template name from first fill if available
        const firstFill = data.find((f: Fill & { templateSlug?: string, templateName?: string }) =>
          (f as Fill & { templateSlug: string }).templateSlug === slug
        );

        if (!firstFill) {
          setNotFoundError(true);
          setLoading(false);
          return;
        }

        setTemplate({
          slug,
          name: (firstFill as Fill & { templateName: string }).templateName || 'Template',
          fills: filteredFills,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch fill history:', err);
        setNotFoundError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-1/4"></div>
          <div className="h-96 bg-[var(--surface-1)] rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  if (notFoundError || !template) {
    notFound();
  }

  const fills = template.fills;

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
          href={`/templates/${slug}`}
          className="text-white px-4 py-2 text-sm font-semibold hover:opacity-90 flex items-center gap-2"
          style={{ backgroundColor: 'var(--brand-primary)', borderRadius: 'var(--radius-sm)' }}
        >
          <Plus size={14} /> New Fill
        </Link>
      </div>

      <Card padding="none" className="overflow-hidden">
        <FillHistoryTable fills={fills} templateSlug={slug} />
      </Card>
    </div>
  );
}
