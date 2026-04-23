'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import TrustLayerBars from '@/components/governance/TrustLayerBars';
import WhartonRadarChart from '@/components/governance/WhartonRadarChart';
import ComplianceDonut from '@/components/governance/ComplianceDonut';
import RiskItemCard from '@/components/governance/RiskItemCard';
import type { GovernanceAssessment, TrustLayerScore, ComplianceCheck } from '@/types/governance';
import { Shield, ArrowRight, ChevronLeft } from 'lucide-react';

export default function GovernanceDetailPage({ params }: { params: { assessmentId: string } }) {
  const [assessment, setAssessment] = useState<GovernanceAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/governance/detail/${params.assessmentId}`)
      .then(r => r.json())
      .then(data => { setAssessment(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.assessmentId]);

  if (loading) return <p className="text-[var(--text-3)] py-12 text-center">Loading assessment...</p>;
  if (!assessment) return <p className="text-[var(--text-3)] py-12 text-center">Assessment not found</p>;

  const trustScores = (assessment.trustLayerScores || []) as TrustLayerScore[];
  const complianceChecks = (assessment.complianceStatus || []) as ComplianceCheck[];
  const whartonScores = assessment.whartonScores || [];
  const riskItems = assessment.riskItems || [];

  const compliant = complianceChecks.filter(c => c.status === 'compliant').length;
  const partial = complianceChecks.filter(c => c.status === 'partial').length;
  const nonCompliant = complianceChecks.filter(c => c.status === 'non_compliant').length;
  const notApplicable = complianceChecks.filter(c => c.status === 'not_applicable').length;

  const riskBadge = (level: string | null) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      low: 'success', medium: 'warning', high: 'error', critical: 'error',
    };
    return map[level || ''] || 'default';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Link href="/governance" className="text-[12px] font-semibold text-[var(--text-4)] hover:text-[var(--accent)] transition-colors mb-2 block">
          <ChevronLeft size={14} className="inline" /> Back to Governance
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Shield size={24} className="text-[var(--accent)]" />
              {assessment.project?.name || `Project #${assessment.projectId}`}
            </h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="accent">{assessment.assessmentType}</Badge>
              <Badge variant={riskBadge(assessment.riskClassification)}>
                Risk: {assessment.riskClassification || 'Unclassified'}
              </Badge>
              <Badge variant="default">{new Date(assessment.assessedAt).toLocaleDateString()}</Badge>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--accent)]">
              {assessment.overallScore != null ? Number(assessment.overallScore).toFixed(1) : '—'}
            </div>
            <div className="text-[12px] text-[var(--text-3)]">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trust Layer Bars */}
        <Card className="lg:col-span-1">
          <h3 className="text-[15px] font-semibold mb-4 text-[var(--text)]">7-Layer Trust Assessment</h3>
          <TrustLayerBars scores={trustScores} />
        </Card>

        {/* Wharton Radar */}
        <div className="lg:col-span-1">
          {whartonScores.length > 0 ? (
            <WhartonRadarChart
              scores={whartonScores.map(w => ({
                domainName: w.domainName,
                score: typeof w.score === 'object' ? Number(w.score) : w.score,
              }))}
            />
          ) : (
            <Card className="text-center py-12">
              <p className="text-[var(--text-3)]">No Wharton scores</p>
            </Card>
          )}
        </div>

        {/* Compliance Donut */}
        <div className="lg:col-span-1">
          <ComplianceDonut
            compliant={compliant}
            partial={partial}
            nonCompliant={nonCompliant}
            notApplicable={notApplicable}
          />
        </div>
      </div>

      {/* Risk Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)]">Risk Register ({riskItems.length})</h2>
          <Link href={`/governance/${params.assessmentId}/risks`} className="text-[13px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1">
            Manage Risks <ArrowRight size={14} />
          </Link>
        </div>
        {riskItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {riskItems.map(r => (
              <RiskItemCard key={r.id} risk={r} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <p className="text-[var(--text-3)]">No risk items identified</p>
          </Card>
        )}
      </div>
    </div>
  );
}
