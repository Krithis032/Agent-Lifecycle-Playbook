import Link from 'next/link';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Award, Plus, ArrowRight, Database } from 'lucide-react';
import { MATURITY_LEVELS } from '@/types/caio';

export const dynamic = 'force-dynamic';

export default async function CaioDashboard() {
  const assessments = await prisma.caioAssessment.findMany({
    include: {
      project: { select: { id: true, name: true } },
      domainScores: { select: { id: true, domainKey: true, score: true } },
    },
    orderBy: { assessedAt: 'desc' },
  });

  const total = assessments.length;
  const avgMaturity = total > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.maturityLevel || 0), 0) / total * 10) / 10
    : 0;

  const maturityColor = (level: number | null) => {
    return MATURITY_LEVELS.find(m => m.level === (level || 0))?.color || '#94a3b8';
  };

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">CAIO Dashboard</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">12-domain AI maturity assessments with Claude Opus-generated insights.</p>
        </div>
        <Link href="/caio/assess" className="bg-[var(--accent)] text-white px-4 py-2 rounded-[6px] text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors flex items-center gap-2">
          <Plus size={16} /> New Assessment
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(139,92,246,0.1)] text-[#7c3aed] flex items-center justify-center">
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">{total}</div>
            <div className="text-sm text-[var(--text-3)]">Total Assessments</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">{avgMaturity.toFixed(1)}</div>
            <div className="text-sm text-[var(--text-3)]">Avg Maturity Level</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
            <Award size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">12</div>
            <div className="text-sm text-[var(--text-3)]">Domains Assessed</div>
          </div>
        </Card>
        {/* KB Coverage Card */}
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#f0fdf4] text-[#15803d] flex items-center justify-center shrink-0">
              <Database size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-[var(--text)]">1,468</div>
              <div className="text-sm text-[var(--text-3)]">KB Concepts · 34+ Sources</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {[
              { label: 'Core', color: '#0052cc' },
              { label: 'RAG/MCP', color: '#6b3fa0' },
              { label: 'IBM', color: '#0e7490' },
              { label: 'LinkedIn', color: '#0077b5' },
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
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-hover)]">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">All Assessments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-hover)] text-[var(--text-3)] font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-[var(--border)]">Initiative</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Mode</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Maturity</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Score</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Project</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Date</th>
                <th className="px-6 py-3 border-b border-[var(--border)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--text)]">{a.initiativeName}</td>
                  <td className="px-6 py-4"><Badge variant="accent">{a.assessmentMode}</Badge></td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: maturityColor(a.maturityLevel) }} />
                      <span className="font-bold text-[var(--text)]">{a.maturityLevel || '—'}</span>
                      <span className="text-[var(--text-3)]">{a.maturityLabel || ''}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--text)]">
                    {a.overallScore != null ? (Number(a.overallScore) * 100).toFixed(0) + '%' : '—'}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-3)]">{a.project?.name || '—'}</td>
                  <td className="px-6 py-4 text-[var(--text-3)]">{new Date(a.assessedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/caio/${a.id}`} className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[13px] font-medium">
                      View <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-3)]">
                    <Award size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                    <p className="font-medium">No CAIO assessments yet</p>
                    <p className="text-[13px] text-[var(--text-4)] mt-1">Create your first 12-domain maturity assessment.</p>
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
