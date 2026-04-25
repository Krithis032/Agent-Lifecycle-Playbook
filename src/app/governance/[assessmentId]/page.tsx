'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import SectionPanel from '@/components/ui/SectionPanel';
import TrustLayerBars from '@/components/governance/TrustLayerBars';
import WhartonRadarChart from '@/components/governance/WhartonRadarChart';
import ComplianceDonut from '@/components/governance/ComplianceDonut';
import RiskItemCard from '@/components/governance/RiskItemCard';
import PeriodicTableGrid from '@/components/governance/PeriodicTableGrid';
import { PERIODIC_TABLE_CATEGORIES } from '@/lib/periodic-table-constants';
import type { GovernanceAssessment, TrustLayerScore, ComplianceCheck, PeriodicCategoryScore } from '@/types/governance';
import { Shield, ArrowRight, ChevronLeft, Grid3X3 } from 'lucide-react';

export default function GovernanceDetailPage({ params }: { params: { assessmentId: string } }) {
  const [assessment, setAssessment] = useState<GovernanceAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/governance/detail/${params.assessmentId}`)
      .then(r => r.json())
      .then(data => { setAssessment(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.assessmentId]);

  if (loading) return <p className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>Loading assessment...</p>;
  if (!assessment) return <p className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>Assessment not found</p>;

  const trustScores = (assessment.trustLayerScores || []) as TrustLayerScore[];
  const complianceChecks = (assessment.complianceStatus || []) as ComplianceCheck[];
  const whartonScores = assessment.whartonScores || [];
  const riskItems = assessment.riskItems || [];

  // Parse periodic table scores from the assessment JSON (stored as JSON field)
  const rawPtScores = (assessment as unknown as Record<string, unknown>).periodicTableScores as PeriodicCategoryScore[] | undefined;
  const ptCategories: PeriodicCategoryScore[] = rawPtScores || PERIODIC_TABLE_CATEGORIES.map(cat => ({
    categoryId: cat.id,
    categoryName: cat.name,
    weight: cat.weight,
    avgScore: 0,
    percentage: 0,
    elementScores: cat.elements.map(el => ({
      code: el.code,
      score: 0,
      notes: '',
      checklist: new Array(el.implementationChecklist.length).fill(false),
    })),
  }));

  const hasPtData = rawPtScores && rawPtScores.some(c => c.avgScore > 0);

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
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          href="/governance"
          className="text-[12px] font-semibold transition-colors mb-2 block"
          style={{ color: 'var(--text-quaternary)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-quaternary)'}
        >
          <ChevronLeft size={14} className="inline" /> Back to Governance
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield size={24} style={{ color: 'var(--module-governance)' }} />
              {assessment.project?.name || `Project #${assessment.projectId}`}
            </h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="brand">{assessment.assessmentType}</Badge>
              <Badge variant={riskBadge(assessment.riskClassification)}>
                Risk: {assessment.riskClassification || 'Unclassified'}
              </Badge>
              <Badge variant="default">{new Date(assessment.assessedAt).toLocaleDateString()}</Badge>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: 'var(--module-governance)' }}>
              {assessment.overallScore != null ? Number(assessment.overallScore).toFixed(1) : '\u2014'}
            </div>
            <div className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Overall Score</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trust Layer Bars */}
        <SectionPanel title="7-Layer Trust Assessment" icon={Shield} className="lg:col-span-1">
          <TrustLayerBars scores={trustScores} />
        </SectionPanel>

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
              <p style={{ color: 'var(--text-tertiary)' }}>No Wharton scores</p>
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

      {/* Periodic Table Summary */}
      <SectionPanel title="Periodic Table Assessment (36 Elements)" icon={Grid3X3}>
        {hasPtData ? (
          <PeriodicTableGrid
            categoryScores={ptCategories}
            compact
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-[13px] mb-2" style={{ color: 'var(--text-tertiary)' }}>No periodic table scores recorded for this assessment.</p>
            <Link
              href="/governance/periodic-table"
              className="text-[13px] font-medium transition-colors"
              style={{ color: 'var(--brand-primary)' }}
            >
              Open Periodic Table Dashboard
            </Link>
          </div>
        )}
      </SectionPanel>

      {/* Risk Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Register ({riskItems.length})</h2>
          <Link
            href={`/governance/${params.assessmentId}/risks`}
            className="text-[13px] font-medium flex items-center gap-1 transition-colors"
            style={{ color: 'var(--brand-primary)' }}
          >
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
            <p style={{ color: 'var(--text-tertiary)' }}>No risk items identified</p>
          </Card>
        )}
      </div>
    </div>
  );
}
