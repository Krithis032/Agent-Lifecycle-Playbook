import Link from 'next/link';
import prisma from '@/lib/prisma';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Shield, Plus, ArrowRight, AlertTriangle } from 'lucide-react';

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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">TRiSM Governance</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">Trust, Risk & Security Management assessments across all projects.</p>
        </div>
        <Link href="/governance/assess" className="bg-[var(--accent)] text-white px-4 py-2 rounded-[6px] text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus size={16} /> New Assessment
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Shield size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">{totalAssessments}</div>
            <div className="text-sm text-[var(--text-3)]">Total Assessments</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center">
            <Shield size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">{avgScore}</div>
            <div className="text-sm text-[var(--text-3)]">Avg Trust Score</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--error-soft)] text-[var(--error)] flex items-center justify-center">
            <AlertTriangle size={24} strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-[var(--text)]">{criticalRisks}</div>
            <div className="text-sm text-[var(--text-3)]">Open Critical Risks</div>
          </div>
        </Card>
      </div>

      {/* Assessment Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">All Assessments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-hover)] text-[var(--text-3)] font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-[var(--border)]">Project</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Type</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Score</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Risk Level</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Open Risks</th>
                <th className="px-6 py-3 border-b border-[var(--border)]">Date</th>
                <th className="px-6 py-3 border-b border-[var(--border)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--text)]">
                    {a.project?.name || `Project #${a.projectId}`}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="accent">{a.assessmentType}</Badge>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--text)]">
                    {a.overallScore != null ? Number(a.overallScore).toFixed(1) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={riskBadge(a.riskClassification)}>
                      {a.riskClassification || 'Unclassified'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-2)]">
                    {a.riskItems?.filter(r => r.status === 'open').length || 0}
                  </td>
                  <td className="px-6 py-4 text-[var(--text-3)]">
                    {new Date(a.assessedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/governance/${a.id}`} className="text-[var(--accent)] hover:underline flex items-center gap-1 text-[13px] font-medium">
                      View <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-3)]">
                    <Shield size={32} className="mx-auto mb-3 text-[var(--text-4)]" />
                    <p className="font-medium">No assessments yet</p>
                    <p className="text-[13px] text-[var(--text-4)] mt-1">Create your first TRiSM governance assessment to get started.</p>
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
