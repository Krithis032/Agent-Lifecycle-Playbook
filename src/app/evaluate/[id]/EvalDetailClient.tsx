'use client';

import { useState } from 'react';
import EvalRadarChart from '@/components/evaluate/EvalRadarChart';
import EvalBarChart from '@/components/evaluate/EvalBarChart';
import { Trophy, Sparkles, Loader2 } from 'lucide-react';
import type { EvalCriterion, EvalScore, WeightedScoreResult } from '@/types/evaluation';
import type { EvalAnalysisResult } from '@/lib/eval-analysis';

interface Props {
  evalId: number;
  criteria: EvalCriterion[];
  scores: EvalScore[];
  weightedScores: WeightedScoreResult[];
  recommendation: string;
  rationale: string;
}

export default function EvalDetailClient({ evalId, criteria, scores, weightedScores, recommendation, rationale }: Props) {
  const [analysis, setAnalysis] = useState<EvalAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const criteriaNames = criteria.map(c => c.name);
  const radarOptions = weightedScores.map(ws => ({
    name: ws.optionName,
    scores: criteria.map(c => scores.find(s => s.optionKey === ws.optionKey && s.criterionKey === c.key)?.score || 0),
  }));

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/evaluate/${evalId}/analyze`, { method: 'POST' });
      const data = await res.json();
      setAnalysis(data);
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendation + AI analysis */}
      <div className="rounded-xl p-5" style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-primary)' }}>
        <div className="flex items-start gap-3">
          <Trophy size={24} className="shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--brand-primary)' }}>Recommendation</div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{recommendation}</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{rationale}</div>
            {!analysis && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-3 px-3 py-1.5 text-xs font-semibold text-white rounded-md hover:opacity-90 flex items-center gap-1.5 disabled:opacity-40"
                style={{ background: 'var(--brand-primary)' }}
              >
                {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {analyzing ? 'Analyzing...' : 'Get AI Analysis'}
              </button>
            )}
          </div>
        </div>
        {analysis && (
          <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--brand-primary) 30%, transparent)' }}>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{analysis.recommendation}</div>
            {analysis.tradeoffs.length > 0 && (
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-tertiary)' }}>Trade-offs</div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {analysis.tradeoffs.map((t, i) => <li key={i} className="flex gap-2"><span style={{ color: 'var(--text-quaternary)' }}>•</span>{t}</li>)}
                </ul>
              </div>
            )}
            {analysis.risks.length > 0 && (
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-tertiary)' }}>Risks</div>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  {analysis.risks.map((r, i) => <li key={i} className="flex gap-2"><span style={{ color: 'var(--status-warning)' }}>•</span>{r}</li>)}
                </ul>
              </div>
            )}
            {analysis.alternativeConditions && (
              <div>
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-tertiary)' }}>When to choose the runner-up</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{analysis.alternativeConditions}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvalRadarChart criteriaNames={criteriaNames} options={radarOptions} />
        <EvalBarChart results={weightedScores} />
      </div>
    </div>
  );
}
