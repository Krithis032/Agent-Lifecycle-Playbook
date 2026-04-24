'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import RadarChart12 from '@/components/caio/RadarChart12';
import MaturityGauge from '@/components/caio/MaturityGauge';
import FindingsPanel from '@/components/caio/FindingsPanel';
import DomainScoreCard from '@/components/caio/DomainScoreCard';
import type { CaioAssessment } from '@/types/caio';
import { CAIO_DOMAINS } from '@/lib/caio-constants';
import { ChevronLeft, ArrowRight, Award } from 'lucide-react';

export default function CaioDetailPage({ params }: { params: { id: string } }) {
  const [assessment, setAssessment] = useState<CaioAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/caio/${params.id}`)
      .then(r => r.json())
      .then(data => { setAssessment(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-[var(--text-3)] py-12 text-center">Loading assessment...</p>;
  if (!assessment) return <p className="text-[var(--text-3)] py-12 text-center">Assessment not found</p>;

  const domainScores = assessment.domainScores || [];
  const findings = assessment.findings || [];
  const actionItems = assessment.actionItems || [];

  // Prepare radar data — map scores back to 1-5 scale
  const radarScores = domainScores.map(d => ({
    domainName: d.domainName,
    score: typeof d.score === 'number' && d.score <= 1 ? d.score * 5 : Number(d.score),
  }));

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header */}
      <div>
        <Link href="/caio" className="text-[12px] font-semibold text-[var(--text-4)] hover:text-[var(--accent)] transition-colors mb-2 block">
          <ChevronLeft size={14} className="inline" /> Back to CAIO
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Award size={24} className="text-[var(--accent)]" />
              {assessment.initiativeName}
            </h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="accent">{assessment.assessmentMode}</Badge>
              {assessment.riskClassification && (
                <Badge variant={assessment.riskClassification === 'low' ? 'success' : assessment.riskClassification === 'critical' ? 'error' : 'warning'}>
                  Risk: {assessment.riskClassification}
                </Badge>
              )}
              <Badge variant="default">{new Date(assessment.assessedAt).toLocaleDateString()}</Badge>
              {assessment.project?.name && (
                <Badge variant="info">{assessment.project.name}</Badge>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[var(--accent)]">
              {assessment.overallScore != null ? (Number(assessment.overallScore) * 100).toFixed(0) + '%' : '—'}
            </div>
            <div className="text-[12px] text-[var(--text-3)]">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Maturity Gauge + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MaturityGauge
            level={assessment.maturityLevel || 1}
            label={assessment.maturityLabel || undefined}
          />
        </div>
        <div className="lg:col-span-2">
          {radarScores.length > 0 ? (
            <RadarChart12 scores={radarScores} />
          ) : (
            <Card className="text-center py-12">
              <p className="text-[var(--text-3)]">No domain scores available</p>
            </Card>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {assessment.executiveSummary && (
        <Card>
          <h3 className="text-[15px] font-bold mb-3 text-[var(--text)]">Executive Summary</h3>
          <p className="text-[13px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{assessment.executiveSummary}</p>
        </Card>
      )}

      {/* Domain Score Cards */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">Domain Scores ({domainScores.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {domainScores.map(d => {
            const domainDef = CAIO_DOMAINS.find(cd => cd.key === d.domainKey);
            return (
              <DomainScoreCard
                key={d.id}
                domainName={d.domainName}
                domainKey={d.domainKey}
                score={d.score}
                riskLevel={d.riskLevel}
                gaps={d.gaps}
                frameworks={domainDef?.frameworks}
              />
            );
          })}
        </div>
      </div>

      {/* Findings */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">Findings ({findings.length})</h2>
        <FindingsPanel findings={findings} />
      </div>

      {/* Action Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]">Action Plan ({actionItems.length})</h2>
          <Link href={`/caio/${params.id}/actions`} className="text-[13px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1">
            Manage Actions <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-2">
          {actionItems.slice(0, 5).map(a => (
            <Card key={a.id} padding="sm" className="flex items-center justify-between">
              <div>
                <span className="text-[13px] text-[var(--text)]">{a.action}</span>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant="accent">{a.phase?.replace('_', ' ')}</Badge>
                  {a.owner && <Badge variant="info">{a.owner}</Badge>}
                </div>
              </div>
              <Badge variant={a.status === 'completed' ? 'success' : a.status === 'in_progress' ? 'info' : 'default'}>
                {a.status}
              </Badge>
            </Card>
          ))}
          {actionItems.length === 0 && (
            <Card className="text-center py-6">
              <p className="text-[var(--text-3)]">No action items</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
