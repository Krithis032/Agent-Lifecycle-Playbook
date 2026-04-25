import Link from 'next/link';
import prisma from '@/lib/prisma';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/ui/PageHeader';
import SectionPanel from '@/components/ui/SectionPanel';
import StatCard from '@/components/ui/StatCard';
import { Shield, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GovernanceDashboard() {
  const assessments = await prisma.governanceAssessment.findMany({
    include: {
      project: { select: { id: true, name: true } },
      riskItems: { select: { id: true, severity: true, status: true } },
    },
    orderBy: { assessedAt: 'desc' },
  });

  const totalAssessments = assessments.length;
  const avgScore = totalAssessments > 0
    ? Math.round(assessments.reduce((sum, a) => sum + (a.overallScore?.toNumber?.() ?? Number(a.overallScore) ?? 0), 0) / totalAssessments * 10) / 10
    : 0;
  const criticalRisks = assessments.reduce(
    (sum, a) => sum + (a.riskItems?.filter(r => r.severity === 'critical' && r.status === 'open').length || 0), 0
  );

  const riskBadge = (level: string | null) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      low: 'success', medium: 'warning', high: 'error', critical: 'error',
    };
    return map[level || ''] || 'default';
  };

  return (
    <div className="animate-fade-in flex flex-col gap-6">
      <PageHeader
        eyebrow="GOVERNANCE"
        title="TRiSM Governance"
        subtitle="Trust, Risk & Security Management assessments across all projects."
        action={
          <Link href="/governance/assess" className="adp-btn-primary flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-semibold">
            <Shield size={16} /> New Assessment
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-grid">
        <StatCard icon={Shield} value={totalAssessments} label="Total Assessments" color="var(--module-governance)" />
        <StatCard icon={TrendingUp} value={avgScore} label="Avg Trust Score" color="var(--status-success)" />
        <StatCard icon={AlertTriangle} value={criticalRisks} label="Open Critical Risks" color="var(--status-error)" />
      </div>

      {/* Assessment Table */}
      <SectionPanel title="All Assessments" icon={Shield}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--surface-0)' }}>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Project</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Type</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Score</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Risk Level</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Open Risks</th>
                <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-default)' }}>Date</th>
                <th className="px-6 py-3" style={{ borderBottom: '1px solid var(--border-default)' }}></th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="group" style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {a.project?.name || `Project #${a.projectId}`}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="brand">{a.assessmentType}</Badge>
                  </td>
                  <td className="px-6 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>
                    {a.overallScore != null ? Number(a.overallScore).toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={riskBadge(a.riskClassification)}>
                      {a.riskClassification || 'Unclassified'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                    {a.riskItems?.filter(r => r.status === 'open').length || 0}
                  </td>
                  <td className="px-6 py-4" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(a.assessedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/governance/${a.id}`} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: 'var(--brand-primary)' }}>
                      View <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                    <Shield size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No assessments yet</p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-quaternary)' }}>Create your first TRiSM governance assessment to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionPanel>
    </div>
  );
}
