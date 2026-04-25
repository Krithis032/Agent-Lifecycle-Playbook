'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import FillHistoryTable from '@/components/templates/FillHistoryTable';
import { FileText, FolderOpen } from 'lucide-react';

interface Fill {
  id: number;
  title: string;
  updatedAt: string;
  template: { slug: string; name: string };
  project: { id: number; name: string } | null;
}

export default function MyDocumentsClient() {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/documents')
      .then((res) => res.json())
      .then((data) => {
        setFills(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch documents:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-[var(--surface-1)] rounded-xl mt-4"></div>
        </div>
      </div>
    );
  }

  const fillRows = fills.map(f => ({
    id: f.id,
    title: f.title,
    projectName: f.project?.name || null,
    updatedAt: f.updatedAt,
    templateName: f.template.name,
    templateSlug: f.template.slug,
  }));

  const templateCount = new Set(fills.map(f => f.template.slug)).size;
  const projectCount = new Set(fills.filter(f => f.project).map(f => f.project!.id)).size;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Documents</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>All filled templates and documents across your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} style={{ color: 'var(--brand-primary)' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Documents</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{fills.length}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={16} style={{ color: '#6b3fa0' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Templates Used</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{templateCount}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={16} style={{ color: '#15803d' }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Projects</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{projectCount}</div>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <FillHistoryTable fills={fillRows} showTemplateName />
      </Card>
    </div>
  );
}
