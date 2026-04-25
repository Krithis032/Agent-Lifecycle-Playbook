'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { FileText, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  fields: unknown;
  phase: { id: number; name: string; slug: string; phaseNum: number } | null;
  _count: { fills: number };
}

const phaseColor = (slug: string | undefined) => {
  const map: Record<string, string> = {
    ideation: '#0052cc', architecture: '#6b3fa0', prototype: '#0e7490',
    pilot: '#b45309', production: '#15803d', operations: '#ba1a1a',
  };
  return map[slug || ''] || '#64748b';
};

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch templates:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalFills = templates.reduce((s, t) => s + t._count.fills, 0);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Template Studio</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Professional templates for agent project documentation.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
            <FileText size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{templates.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Templates</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--status-success-soft)', color: 'var(--status-success)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalFills}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Documents Created</div>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(139,92,246,0.1)] flex items-center justify-center" style={{ color: '#7c3aed' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AI</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Assist Available</div>
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
              className="group rounded-xl overflow-hidden transition-all"
              style={{ backgroundColor: 'var(--surface-elevated)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-default)' }}
            >
              <div className="h-1.5" style={{ backgroundColor: color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-[15px] font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{t.description}</p>
                  </div>
                  <FileText size={18} className="shrink-0" style={{ color: 'var(--text-quaternary)' }} />
                </div>
                <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--text-quaternary)' }}>
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
                    className="flex-1 px-3 py-2 text-center text-sm font-semibold text-white rounded-lg transition-opacity flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  >
                    <Plus size={14} /> New Fill
                  </Link>
                  {t._count.fills > 0 && (
                    <Link
                      href={`/templates/${t.slug}/fills`}
                      className="px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
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
