'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { BarChart3, Plus, ArrowRight, Layers, Cpu, Sparkles } from 'lucide-react';

interface Evaluation {
  id: number;
  title: string;
  evalType: string;
  recommendation: string | null;
  createdAt: string;
  project: { id: number; name: string } | null;
}

const typeBadge = (t: string) => {
  const map: Record<string, { variant: 'brand' | 'success' | 'info' | 'warning'; label: string }> = {
    framework: { variant: 'brand', label: 'Framework' },
    architecture: { variant: 'success', label: 'Architecture' },
    model_tier: { variant: 'info', label: 'Preset' },
    custom: { variant: 'warning', label: 'Custom' },
  };
  return map[t] || { variant: 'brand' as const, label: t };
};

export default function EvaluateClient() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/evaluate')
      .then((res) => res.json())
      .then((data) => {
        setEvaluations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch evaluations:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-[var(--surface-1)] rounded-xl mt-4"></div>
        </div>
      </div>
    );
  }

  const total = evaluations.length;
  const byType = evaluations.reduce((acc, e) => {
    acc[e.evalType] = (acc[e.evalType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="Evaluate"
          title="Evaluation Matrix"
          subtitle="Weighted scoring for framework, architecture, and custom decisions."
        />
        <Link
          href="/evaluate/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 flex items-center gap-2"
          style={{ background: 'var(--module-evaluate)' }}
        >
          <Plus size={16} /> New Evaluation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{total}</div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total Evaluations</div>
          </div>
        </Card>
        {(['framework', 'architecture', 'custom'] as const).map(t => {
          const tb = typeBadge(t);
          return (
            <Card key={t} className="flex items-center gap-3">
              <Badge variant={tb.variant}>{tb.label}</Badge>
              <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{byType[t] || 0}</span>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/evaluate/new?type=framework" className="flex items-center gap-3 p-4 rounded-xl transition-all" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
          <Layers size={18} style={{ color: 'var(--module-evaluate)' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Compare Frameworks</div>
            <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>LangGraph vs CrewAI vs Claude SDK...</div>
          </div>
        </Link>
        <Link href="/evaluate/new?type=architecture" className="flex items-center gap-3 p-4 rounded-xl transition-all" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
          <Cpu size={18} style={{ color: 'var(--status-success)' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Architecture Selection</div>
            <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Single Agent vs Pipeline vs Supervisor...</div>
          </div>
        </Link>
        <Link href="/evaluate/new?type=model_tier" className="flex items-center gap-3 p-4 rounded-xl transition-all" style={{ border: '1px solid var(--border-default)', background: 'var(--surface-elevated)' }}>
          <Sparkles size={18} style={{ color: '#7c3aed' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Use Preset</div>
            <div className="text-xs" style={{ color: 'var(--text-quaternary)' }}>Customer Support, Code Gen, Research...</div>
          </div>
        </Link>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>All Evaluations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-1)' }}>
              <tr>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Title</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Type</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Recommendation</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Project</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Date</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}></th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(e => {
                const tb = typeBadge(e.evalType);
                return (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{e.title}</td>
                    <td className="px-6 py-4"><Badge variant={tb.variant}>{tb.label}</Badge></td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{e.recommendation || '—'}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>{e.project?.name || '—'}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Link href={`/evaluate/${e.id}`} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: 'var(--module-evaluate)' }}>
                        View <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                    <BarChart3 size={32} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
                    <p className="font-medium">No evaluations yet</p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-quaternary)' }}>Create your first evaluation to compare frameworks, architectures, or custom options.</p>
                    <Link href="/evaluate/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90" style={{ background: 'var(--module-evaluate)' }}>
                      <Plus size={14} /> New Evaluation
                    </Link>
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
