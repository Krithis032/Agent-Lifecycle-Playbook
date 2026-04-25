'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { Award, Plus, ArrowRight, Database } from 'lucide-react';
import { MATURITY_LEVELS } from '@/types/caio';

interface Assessment {
  id: number;
  initiativeName: string;
  assessmentMode: string;
  maturityLevel: number | null;
  maturityLabel: string | null;
  overallScore: number | null;
  assessedAt: string;
  project: { id: number; name: string } | null;
  domainScores: { id: number; domainKey: string; score: number }[];
}

const maturityColor = (level: number | null) => {
  return MATURITY_LEVELS.find(m => m.level === (level || 0))?.color || '#94a3b8';
};

export default function CaioClient() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/caio')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setAssessments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch assessments:', err);
        setAssessments([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--surface-1)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--surface-1)] rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-[var(--surface-1)] rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-[var(--surface-1)] rounded-xl mt-4"></div>
        </div>
      </div>
    );
  }

  const total = assessments.length;
  const avgMaturity = total > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.maturityLevel || 0), 0) / total * 10) / 10
    : 0;

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          eyebrow="CAIO"
          title="CAIO Dashboard"
          subtitle="12-domain AI maturity assessments with Claude Opus-generated insights."
        />
        <Link
          href="/caio/assess"
          className="px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-semibold flex items-center gap-2 transition-colors"
          style={{ background: 'var(--module-caio)', color: 'white' }}
        >
          <Plus size={16} /> New Assessment
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--module-caio) 10%, transparent)', color: 'var(--module-caio)' }}>
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{total}</div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Total Assessments</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{avgMaturity.toFixed(1)}</div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Avg Maturity Level</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--status-success-soft)', color: 'var(--status-success)' }}>
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>12</div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Domains Assessed</div>
          </div>
        </Card>
        {/* KB Coverage Card */}
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--status-success-soft)', color: 'var(--status-success)' }}>
              <Database size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>1,468</div>
              <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>KB Concepts · 34+ Sources</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {[
              { label: 'Core', color: '#0052cc' },
              { label: 'RAG/MCP', color: '#6b3fa0' },
              { label: 'Enterprise', color: '#0e7490' },
              { label: 'Agents & Tools', color: '#0077b5' },
              { label: 'Strategy', color: '#15803d' },
            ].map((t) => (
              <span
                key={t.label}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: t.color }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>All Assessments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: 'var(--surface-1)' }}>
              <tr>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Initiative</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Mode</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Maturity</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Score</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Project</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}>Date</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-quaternary)', borderBottom: '1px solid var(--border-default)' }}></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td className="px-6 py-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{a.initiativeName}</td>
                  <td className="px-6 py-4"><Badge variant="brand">{a.assessmentMode}</Badge></td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: maturityColor(a.maturityLevel) }} />
                      <span className="font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>{a.maturityLevel || '—'}</span>
                      <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{a.maturityLabel || ''}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {a.overallScore != null ? (Number(a.overallScore) * 100).toFixed(0) + '%' : '—'}
                  </td>
                  <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{a.project?.name || '—'}</td>
                  <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{new Date(a.assessedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/caio/${a.id}`}
                      className="flex items-center gap-1 text-[13px] font-medium transition-colors"
                      style={{ color: 'var(--brand-primary)' }}
                    >
                      View <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Award size={32} className="mx-auto mb-3" style={{ color: 'var(--text-quaternary)' }} />
                    <p className="text-[13px] font-medium" style={{ color: 'var(--text-tertiary)' }}>No CAIO assessments yet</p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-quaternary)' }}>Create your first 12-domain maturity assessment.</p>
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
